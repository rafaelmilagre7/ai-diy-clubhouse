
interface SitemapURL {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

class SitemapGenerator {
  private baseUrl = 'https://app.viverdeia.com';
  
  // URLs estáticas do site
  private staticRoutes: Omit<SitemapURL, 'lastmod'>[] = [
    { loc: '/', changefreq: 'weekly', priority: 1.0 },
    { loc: '/dashboard', changefreq: 'daily', priority: 0.9 },
    { loc: '/solutions', changefreq: 'daily', priority: 0.9 },
    { loc: '/tools', changefreq: 'weekly', priority: 0.8 },
    { loc: '/learning', changefreq: 'weekly', priority: 0.8 },
    { loc: '/community', changefreq: 'daily', priority: 0.7 },
    { loc: '/benefits', changefreq: 'monthly', priority: 0.6 },
    { loc: '/events', changefreq: 'weekly', priority: 0.7 }
  ];

  /**
   * Gera o sitemap XML completo
   */
  async generateSitemap(): Promise<string> {
    try {
      const urls: SitemapURL[] = [];
      const now = new Date().toISOString();

      // Adicionar rotas estáticas
      urls.push(...this.staticRoutes.map(route => ({
        ...route,
        loc: `${this.baseUrl}${route.loc}`,
        lastmod: now
      })));

      // Adicionar soluções dinâmicas
      const solutionUrls = await this.getSolutionUrls();
      urls.push(...solutionUrls);

      // Adicionar ferramentas dinâmicas
      const toolUrls = await this.getToolUrls();
      urls.push(...toolUrls);

      // Adicionar cursos dinâmicos
      const courseUrls = await this.getCourseUrls();
      urls.push(...courseUrls);

      return this.generateXML(urls);
    } catch (error) {
      console.error('Erro ao gerar sitemap:', error);
      return this.generateXML([]);
    }
  }

  /**
   * Obtém URLs das soluções
   */
  private async getSolutionUrls(): Promise<SitemapURL[]> {
    try {
      // Simulação - na implementação real, isso viria do Supabase
      const solutions = await this.fetchSolutions();
      
      return solutions.map(solution => ({
        loc: `${this.baseUrl}/solution/${solution.id}`,
        lastmod: solution.updated_at || new Date().toISOString(),
        changefreq: 'weekly' as const,
        priority: 0.8
      }));
    } catch (error) {
      console.error('Erro ao buscar soluções para sitemap:', error);
      return [];
    }
  }

  /**
   * Obtém URLs das ferramentas
   */
  private async getToolUrls(): Promise<SitemapURL[]> {
    try {
      const tools = await this.fetchTools();
      
      return tools.map(tool => ({
        loc: `${this.baseUrl}/tool/${tool.id}`,
        lastmod: tool.updated_at || new Date().toISOString(),
        changefreq: 'monthly' as const,
        priority: 0.6
      }));
    } catch (error) {
      console.error('Erro ao buscar ferramentas para sitemap:', error);
      return [];
    }
  }

  /**
   * Obtém URLs dos cursos
   */
  private async getCourseUrls(): Promise<SitemapURL[]> {
    try {
      const courses = await this.fetchCourses();
      
      return courses.map(course => ({
        loc: `${this.baseUrl}/learning/course/${course.id}`,
        lastmod: course.updated_at || new Date().toISOString(),
        changefreq: 'weekly' as const,
        priority: 0.7
      }));
    } catch (error) {
      console.error('Erro ao buscar cursos para sitemap:', error);
      return [];
    }
  }

  /**
   * Métodos de fetch - implementar com Supabase real
   */
  private async fetchSolutions() {
    // Implementar busca real do Supabase
    return [];
  }

  private async fetchTools() {
    // Implementar busca real do Supabase
    return [];
  }

  private async fetchCourses() {
    // Implementar busca real do Supabase
    return [];
  }

  /**
   * Gera o XML do sitemap
   */
  private generateXML(urls: SitemapURL[]): string {
    const urlElements = urls.map(url => `
  <url>
    <loc>${this.escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
  }

  /**
   * Escapa caracteres especiais para XML
   */
  private escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case "'": return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }
}

export const sitemapGenerator = new SitemapGenerator();
