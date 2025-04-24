export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analytics: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          module_id: string | null
          solution_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          module_id?: string | null
          solution_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          module_id?: string | null
          solution_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_url: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          image_url: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          name?: string
        }
        Relationships: []
      }
      benefit_clicks: {
        Row: {
          benefit_link: string
          clicked_at: string | null
          id: string
          tool_id: string
          user_id: string
        }
        Insert: {
          benefit_link: string
          clicked_at?: string | null
          id?: string
          tool_id: string
          user_id: string
        }
        Update: {
          benefit_link?: string
          clicked_at?: string | null
          id?: string
          tool_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "benefit_clicks_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      implementation_checkpoints: {
        Row: {
          checkpoint_order: number
          created_at: string | null
          description: string
          id: string
          solution_id: string | null
        }
        Insert: {
          checkpoint_order: number
          created_at?: string | null
          description: string
          id?: string
          solution_id?: string | null
        }
        Update: {
          checkpoint_order?: number
          created_at?: string | null
          description?: string
          id?: string
          solution_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "implementation_checkpoints_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      implementation_trails: {
        Row: {
          created_at: string
          error_message: string | null
          generation_attempts: number
          id: string
          status: string
          trail_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          generation_attempts?: number
          id?: string
          status?: string
          trail_data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          generation_attempts?: number
          id?: string
          status?: string
          trail_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      modules: {
        Row: {
          certificate_template: Json | null
          content: Json
          created_at: string
          estimated_time_minutes: number | null
          id: string
          metrics: Json | null
          module_order: number
          solution_id: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          certificate_template?: Json | null
          content: Json
          created_at?: string
          estimated_time_minutes?: number | null
          id?: string
          metrics?: Json | null
          module_order: number
          solution_id: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          certificate_template?: Json | null
          content?: Json
          created_at?: string
          estimated_time_minutes?: number | null
          id?: string
          metrics?: Json | null
          module_order?: number
          solution_id?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_chat_messages: {
        Row: {
          created_at: string | null
          id: string
          is_ai: boolean
          message: string
          step_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_ai?: boolean
          message: string
          step_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_ai?: boolean
          message?: string
          step_id?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_complementary_info: {
        Row: {
          authorize_case_studies: boolean | null
          authorize_testimonials: boolean | null
          created_at: string | null
          how_discovered: string | null
          id: string
          interested_in_interviews: boolean | null
          referral_name: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          authorize_case_studies?: boolean | null
          authorize_testimonials?: boolean | null
          created_at?: string | null
          how_discovered?: string | null
          id?: string
          interested_in_interviews?: boolean | null
          referral_name?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          authorize_case_studies?: boolean | null
          authorize_testimonials?: boolean | null
          created_at?: string | null
          how_discovered?: string | null
          id?: string
          interested_in_interviews?: boolean | null
          referral_name?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      onboarding_history: {
        Row: {
          created_at: string | null
          data: Json
          id: string
          onboarding_id: string | null
          step_name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data: Json
          id?: string
          onboarding_id?: string | null
          step_name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
          onboarding_id?: string | null
          step_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_history_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "onboarding_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_professional_info: {
        Row: {
          annual_revenue: string | null
          company_name: string | null
          company_sector: string | null
          company_size: string | null
          company_website: string | null
          created_at: string | null
          current_position: string | null
          id: string
          progress_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          annual_revenue?: string | null
          company_name?: string | null
          company_sector?: string | null
          company_size?: string | null
          company_website?: string | null
          created_at?: string | null
          current_position?: string | null
          id?: string
          progress_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          annual_revenue?: string | null
          company_name?: string | null
          company_sector?: string | null
          company_size?: string | null
          company_website?: string | null
          created_at?: string | null
          current_position?: string | null
          id?: string
          progress_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_professional_info_progress_id_fkey"
            columns: ["progress_id"]
            isOneToOne: false
            referencedRelation: "onboarding_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_progress: {
        Row: {
          ai_experience: Json | null
          ai_knowledge_level: string | null
          annual_revenue: string | null
          budget_range: string | null
          business_context: Json | null
          business_data: Json | null
          business_goals: Json | null
          company_data: Json | null
          company_name: string | null
          company_sector: string | null
          company_size: string | null
          company_website: string | null
          complementary_info: Json
          completed_steps: string[] | null
          created_at: string | null
          current_position: string | null
          current_step: string | null
          debug_logs: Json | null
          decision_makers: string[] | null
          experience_personalization: Json | null
          goals: string[] | null
          id: string
          implementation_preferences: Json | null
          implementation_speed: string | null
          industry_focus: Json | null
          is_completed: boolean | null
          last_error: string | null
          last_sync_at: string | null
          personal_info: Json | null
          priority_areas: string[] | null
          professional_data: Json | null
          professional_info: Json | null
          resources_needs: Json | null
          support_level: string | null
          sync_status: string | null
          target_market: string | null
          team_info: Json | null
          team_size: string | null
          tech_stack: string[] | null
          technical_expertise: string | null
          training_needs: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_experience?: Json | null
          ai_knowledge_level?: string | null
          annual_revenue?: string | null
          budget_range?: string | null
          business_context?: Json | null
          business_data?: Json | null
          business_goals?: Json | null
          company_data?: Json | null
          company_name?: string | null
          company_sector?: string | null
          company_size?: string | null
          company_website?: string | null
          complementary_info?: Json
          completed_steps?: string[] | null
          created_at?: string | null
          current_position?: string | null
          current_step?: string | null
          debug_logs?: Json | null
          decision_makers?: string[] | null
          experience_personalization?: Json | null
          goals?: string[] | null
          id?: string
          implementation_preferences?: Json | null
          implementation_speed?: string | null
          industry_focus?: Json | null
          is_completed?: boolean | null
          last_error?: string | null
          last_sync_at?: string | null
          personal_info?: Json | null
          priority_areas?: string[] | null
          professional_data?: Json | null
          professional_info?: Json | null
          resources_needs?: Json | null
          support_level?: string | null
          sync_status?: string | null
          target_market?: string | null
          team_info?: Json | null
          team_size?: string | null
          tech_stack?: string[] | null
          technical_expertise?: string | null
          training_needs?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_experience?: Json | null
          ai_knowledge_level?: string | null
          annual_revenue?: string | null
          budget_range?: string | null
          business_context?: Json | null
          business_data?: Json | null
          business_goals?: Json | null
          company_data?: Json | null
          company_name?: string | null
          company_sector?: string | null
          company_size?: string | null
          company_website?: string | null
          complementary_info?: Json
          completed_steps?: string[] | null
          created_at?: string | null
          current_position?: string | null
          current_step?: string | null
          debug_logs?: Json | null
          decision_makers?: string[] | null
          experience_personalization?: Json | null
          goals?: string[] | null
          id?: string
          implementation_preferences?: Json | null
          implementation_speed?: string | null
          industry_focus?: Json | null
          is_completed?: boolean | null
          last_error?: string | null
          last_sync_at?: string | null
          personal_info?: Json | null
          priority_areas?: string[] | null
          professional_data?: Json | null
          professional_info?: Json | null
          resources_needs?: Json | null
          support_level?: string | null
          sync_status?: string | null
          target_market?: string | null
          team_info?: Json | null
          team_size?: string | null
          tech_stack?: string[] | null
          technical_expertise?: string | null
          training_needs?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          email: string
          id: string
          industry: string | null
          name: string | null
          role: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          id: string
          industry?: string | null
          name?: string | null
          role?: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          id?: string
          industry?: string | null
          name?: string | null
          role?: string
        }
        Relationships: []
      }
      progress: {
        Row: {
          completed_at: string | null
          completed_modules: number[] | null
          created_at: string
          current_module: number
          id: string
          is_completed: boolean
          last_activity: string
          solution_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_modules?: number[] | null
          created_at?: string
          current_module?: number
          id?: string
          is_completed?: boolean
          last_activity?: string
          solution_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_modules?: number[] | null
          created_at?: string
          current_module?: number
          id?: string
          is_completed?: boolean
          last_activity?: string
          solution_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      solution_comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "solution_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "solution_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      solution_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          likes_count: number
          module_id: string | null
          parent_id: string | null
          solution_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number
          module_id?: string | null
          parent_id?: string | null
          solution_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number
          module_id?: string | null
          parent_id?: string | null
          solution_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "solution_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "solution_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      solution_metrics: {
        Row: {
          abandonment_rates: Json | null
          average_completion_time: number | null
          id: string
          last_updated: string | null
          solution_id: string | null
          total_completions: number | null
          total_starts: number | null
          total_views: number | null
        }
        Insert: {
          abandonment_rates?: Json | null
          average_completion_time?: number | null
          id?: string
          last_updated?: string | null
          solution_id?: string | null
          total_completions?: number | null
          total_starts?: number | null
          total_views?: number | null
        }
        Update: {
          abandonment_rates?: Json | null
          average_completion_time?: number | null
          id?: string
          last_updated?: string | null
          solution_id?: string | null
          total_completions?: number | null
          total_starts?: number | null
          total_views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "solution_metrics_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      solution_resources: {
        Row: {
          created_at: string | null
          format: string | null
          id: string
          metadata: Json | null
          module_id: string | null
          name: string
          size: number | null
          solution_id: string | null
          type: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          format?: string | null
          id?: string
          metadata?: Json | null
          module_id?: string | null
          name: string
          size?: number | null
          solution_id?: string | null
          type: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          format?: string | null
          id?: string
          metadata?: Json | null
          module_id?: string | null
          name?: string
          size?: number | null
          solution_id?: string | null
          type?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "solution_resources_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solution_resources_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      solution_tools: {
        Row: {
          created_at: string | null
          id: string
          is_required: boolean | null
          solution_id: string | null
          tool_name: string
          tool_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          solution_id?: string | null
          tool_name: string
          tool_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          solution_id?: string | null
          tool_name?: string
          tool_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solution_tools_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      solution_tools_reference: {
        Row: {
          created_at: string
          id: string
          solution_id: string | null
          tool_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          solution_id?: string | null
          tool_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          solution_id?: string | null
          tool_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solution_tools_reference_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solution_tools_reference_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      solutions: {
        Row: {
          category: string
          created_at: string
          description: string
          difficulty: string
          estimated_time: number | null
          id: string
          published: boolean
          related_solutions: string[] | null
          slug: string
          success_rate: number | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          difficulty: string
          estimated_time?: number | null
          id?: string
          published?: boolean
          related_solutions?: string[] | null
          slug: string
          success_rate?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          difficulty?: string
          estimated_time?: number | null
          id?: string
          published?: boolean
          related_solutions?: string[] | null
          slug?: string
          success_rate?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      suggestion_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      suggestion_comment_votes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
          vote_type: Database["public"]["Enums"]["vote_type"]
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
          vote_type: Database["public"]["Enums"]["vote_type"]
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
          vote_type?: Database["public"]["Enums"]["vote_type"]
        }
        Relationships: [
          {
            foreignKeyName: "suggestion_comment_votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "suggestion_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestion_comments: {
        Row: {
          content: string
          created_at: string
          downvotes: number
          id: string
          is_hidden: boolean
          is_official: boolean
          parent_id: string | null
          suggestion_id: string
          updated_at: string
          upvotes: number
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          downvotes?: number
          id?: string
          is_hidden?: boolean
          is_official?: boolean
          parent_id?: string | null
          suggestion_id: string
          updated_at?: string
          upvotes?: number
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          downvotes?: number
          id?: string
          is_hidden?: boolean
          is_official?: boolean
          parent_id?: string | null
          suggestion_id?: string
          updated_at?: string
          upvotes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestion_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "suggestion_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestion_comments_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestion_comments_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions_with_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestion_notifications: {
        Row: {
          comment_id: string | null
          content: string | null
          created_at: string
          id: string
          is_read: boolean
          suggestion_id: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          suggestion_id: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          comment_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          suggestion_id?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestion_notifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "suggestion_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestion_notifications_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestion_notifications_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions_with_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestion_votes: {
        Row: {
          created_at: string
          id: string
          suggestion_id: string
          updated_at: string
          user_id: string
          vote_type: Database["public"]["Enums"]["vote_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          suggestion_id: string
          updated_at?: string
          user_id: string
          vote_type: Database["public"]["Enums"]["vote_type"]
        }
        Update: {
          created_at?: string
          id?: string
          suggestion_id?: string
          updated_at?: string
          user_id?: string
          vote_type?: Database["public"]["Enums"]["vote_type"]
        }
        Relationships: [
          {
            foreignKeyName: "suggestion_votes_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestion_votes_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions_with_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestions: {
        Row: {
          category_id: string | null
          comment_count: number
          created_at: string
          description: string
          downvotes: number
          id: string
          image_url: string | null
          is_hidden: boolean
          is_pinned: boolean
          profiles: Json | null
          status: Database["public"]["Enums"]["suggestion_status"]
          title: string
          updated_at: string
          upvotes: number
          user_id: string
        }
        Insert: {
          category_id?: string | null
          comment_count?: number
          created_at?: string
          description: string
          downvotes?: number
          id?: string
          image_url?: string | null
          is_hidden?: boolean
          is_pinned?: boolean
          profiles?: Json | null
          status?: Database["public"]["Enums"]["suggestion_status"]
          title: string
          updated_at?: string
          upvotes?: number
          user_id: string
        }
        Update: {
          category_id?: string | null
          comment_count?: number
          created_at?: string
          description?: string
          downvotes?: number
          id?: string
          image_url?: string | null
          is_hidden?: boolean
          is_pinned?: boolean
          profiles?: Json | null
          status?: Database["public"]["Enums"]["suggestion_status"]
          title?: string
          updated_at?: string
          upvotes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "suggestion_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "tool_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          likes_count: number
          parent_id: string | null
          tool_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number
          parent_id?: string | null
          tool_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number
          parent_id?: string | null
          tool_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "tool_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          benefit_badge_url: string | null
          benefit_clicks: number | null
          benefit_description: string | null
          benefit_link: string | null
          benefit_title: string | null
          benefit_type: string | null
          category: string
          created_at: string
          description: string
          has_member_benefit: boolean | null
          id: string
          logo_url: string | null
          name: string
          official_url: string
          status: boolean | null
          tags: string[] | null
          updated_at: string
          video_tutorials: Json | null
          video_type: string | null
          video_url: string | null
        }
        Insert: {
          benefit_badge_url?: string | null
          benefit_clicks?: number | null
          benefit_description?: string | null
          benefit_link?: string | null
          benefit_title?: string | null
          benefit_type?: string | null
          category: string
          created_at?: string
          description: string
          has_member_benefit?: boolean | null
          id?: string
          logo_url?: string | null
          name: string
          official_url: string
          status?: boolean | null
          tags?: string[] | null
          updated_at?: string
          video_tutorials?: Json | null
          video_type?: string | null
          video_url?: string | null
        }
        Update: {
          benefit_badge_url?: string | null
          benefit_clicks?: number | null
          benefit_description?: string | null
          benefit_link?: string | null
          benefit_title?: string | null
          benefit_type?: string | null
          category?: string
          created_at?: string
          description?: string
          has_member_benefit?: boolean | null
          id?: string
          logo_url?: string | null
          name?: string
          official_url?: string
          status?: boolean | null
          tags?: string[] | null
          updated_at?: string
          video_tutorials?: Json | null
          video_type?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_checklists: {
        Row: {
          checked_items: Json | null
          created_at: string
          id: string
          solution_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          checked_items?: Json | null
          created_at?: string
          id?: string
          solution_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          checked_items?: Json | null
          created_at?: string
          id?: string
          solution_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_checklists_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
    }
    Views: {
      onboarding_analytics: {
        Row: {
          ai_experience: Json | null
          business_goals: Json | null
          company_name: string | null
          current_step: string | null
          email: string | null
          implementation_preferences: Json | null
          industry_focus: Json | null
          is_completed: boolean | null
          last_activity: string | null
          personal_info: Json | null
          resources_needs: Json | null
          started_at: string | null
          team_info: Json | null
          user_id: string | null
        }
        Relationships: []
      }
      onboarding_status: {
        Row: {
          tabela: string | null
          total_registros: number | null
        }
        Relationships: []
      }
      suggestions_with_profiles: {
        Row: {
          category_id: string | null
          comment_count: number | null
          created_at: string | null
          description: string | null
          downvotes: number | null
          id: string | null
          image_url: string | null
          is_hidden: boolean | null
          is_pinned: boolean | null
          profiles: Json | null
          status: Database["public"]["Enums"]["suggestion_status"] | null
          title: string | null
          updated_at: string | null
          upvotes: number | null
          user_avatar: string | null
          user_id: string | null
          user_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suggestions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "suggestion_categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_onboarding_data_consistency: {
        Args: { progress_id: string }
        Returns: Json
      }
      decrement: {
        Args: { row_id: string; table_name: string; column_name: string }
        Returns: undefined
      }
      decrement_suggestion_downvote: {
        Args: { suggestion_id: string }
        Returns: undefined
      }
      decrement_suggestion_upvote: {
        Args: { suggestion_id: string }
        Returns: undefined
      }
      increment: {
        Args: { row_id: string; table_name: string; column_name: string }
        Returns: undefined
      }
      increment_suggestion_downvote: {
        Args: { suggestion_id: string }
        Returns: undefined
      }
      increment_suggestion_upvote: {
        Args: { suggestion_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      limpar_dados_onboarding: {
        Args: { user_id_param?: string }
        Returns: string
      }
      merge_json_data: {
        Args: { target: Json; source: Json }
        Returns: Json
      }
    }
    Enums: {
      notification_type:
        | "status_change"
        | "new_comment"
        | "new_vote"
        | "comment_reply"
        | "admin_response"
      suggestion_status:
        | "new"
        | "under_review"
        | "approved"
        | "in_development"
        | "implemented"
        | "rejected"
      vote_type: "upvote" | "downvote"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      notification_type: [
        "status_change",
        "new_comment",
        "new_vote",
        "comment_reply",
        "admin_response",
      ],
      suggestion_status: [
        "new",
        "under_review",
        "approved",
        "in_development",
        "implemented",
        "rejected",
      ],
      vote_type: ["upvote", "downvote"],
    },
  },
} as const
