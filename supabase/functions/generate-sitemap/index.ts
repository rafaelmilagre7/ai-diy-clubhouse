
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get base URL from environment or use default
    const baseUrl = Deno.env.get('SITE_URL') || 'https://app.viverdeia.ai'
    
    console.log('Generating sitemap for:', baseUrl)

    // Static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/login', priority: '0.8', changefreq: 'monthly' },
      { url: '/dashboard', priority: '0.9', changefreq: 'daily' },
      { url: '/solutions', priority: '0.9', changefreq: 'weekly' },
      { url: '/tools', priority: '0.8', changefreq: 'weekly' },
      { url: '/learning', priority: '0.8', changefreq: 'weekly' },
      { url: '/community', priority: '0.7', changefreq: 'daily' },
    ]

    // Get published solutions
    const { data: solutions } = await supabase
      .from('solutions')
      .select('slug, updated_at')
      .eq('published', true)
      .order('updated_at', { ascending: false })

    // Get published tools
    const { data: tools } = await supabase
      .from('tools')
      .select('id, updated_at')
      .eq('status', true)
      .order('updated_at', { ascending: false })

    // Get published courses
    const { data: courses } = await supabase
      .from('learning_courses')
      .select('slug, updated_at')
      .eq('published', true)
      .order('updated_at', { ascending: false })

    // Get forum categories
    const { data: categories } = await supabase
      .from('forum_categories')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })

    // Build sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`

    // Add static pages
    staticPages.forEach(page => {
      sitemap += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
`
    })

    // Add solutions
    if (solutions) {
      solutions.forEach(solution => {
        const lastmod = new Date(solution.updated_at).toISOString().split('T')[0]
        sitemap += `  <url>
    <loc>${baseUrl}/solutions/${solution.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${lastmod}</lastmod>
  </url>
`
      })
    }

    // Add tools
    if (tools) {
      tools.forEach(tool => {
        const lastmod = new Date(tool.updated_at).toISOString().split('T')[0]
        sitemap += `  <url>
    <loc>${baseUrl}/tools/${tool.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <lastmod>${lastmod}</lastmod>
  </url>
`
      })
    }

    // Add courses
    if (courses) {
      courses.forEach(course => {
        const lastmod = new Date(course.updated_at).toISOString().split('T')[0]
        sitemap += `  <url>
    <loc>${baseUrl}/learning/courses/${course.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${lastmod}</lastmod>
  </url>
`
      })
    }

    // Add forum categories
    if (categories) {
      categories.forEach(category => {
        const lastmod = new Date(category.updated_at).toISOString().split('T')[0]
        sitemap += `  <url>
    <loc>${baseUrl}/community/category/${category.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
    <lastmod>${lastmod}</lastmod>
  </url>
`
      })
    }

    sitemap += `</urlset>`

    console.log('Sitemap generated successfully')

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })

  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate sitemap' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
