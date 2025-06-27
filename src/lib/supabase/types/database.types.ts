export interface Database {
  public: {
    Tables: {
      admin_communications: {
        Row: {
          id: string;
          title: string;
          content: string;
          content_type: string;
          priority: string;
          template_type: string;
          status: string;
          delivery_channels: string[];
          target_roles: string[];
          scheduled_for: string | null;
          created_at: string;
          created_by: string;
          sent_at: string | null;
          metadata: Record<string, any>;
          updated_at: string;
          email_subject: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          content_type?: string;
          priority?: string;
          template_type?: string;
          status?: string;
          delivery_channels?: string[];
          target_roles: string[];
          scheduled_for?: string | null;
          created_by: string;
          sent_at?: string | null;
          metadata?: Record<string, any>;
          updated_at?: string;
          email_subject?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          content_type?: string;
          priority?: string;
          template_type?: string;
          status?: string;
          delivery_channels?: string[];
          target_roles?: string[];
          scheduled_for?: string | null;
          created_by?: string;
          sent_at?: string | null;
          metadata?: Record<string, any>;
          updated_at?: string;
          email_subject?: string | null;
        };
        Relationships: [];
      };
      analytics: {
        Row: {
          id: string;
          created_at: string;
          event_type: string;
          user_id: string;
          solution_id: string | null;
          module_id: string | null;
          event_data: Record<string, any> | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          event_type: string;
          user_id: string;
          solution_id?: string | null;
          module_id?: string | null;
          event_data?: Record<string, any> | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          event_type?: string;
          user_id?: string;
          solution_id?: string | null;
          module_id?: string | null;
          event_data?: Record<string, any> | null;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          timestamp: string;
          session_id: string | null;
          details: Record<string, any>;
          user_agent: string | null;
          action: string;
          resource_id: string | null;
          ip_address: string | null;
          event_type: string;
          severity: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          timestamp?: string;
          session_id?: string | null;
          details?: Record<string, any>;
          user_agent?: string | null;
          action: string;
          resource_id?: string | null;
          ip_address?: string | null;
          event_type: string;
          severity?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          timestamp?: string;
          session_id?: string | null;
          details?: Record<string, any>;
          user_agent?: string | null;
          action?: string;
          resource_id?: string | null;
          ip_address?: string | null;
          event_type?: string;
          severity?: string | null;
        };
        Relationships: [];
      };
      benefit_access_control: {
        Row: {
          id: string;
          role_id: string;
          tool_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          role_id: string;
          tool_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          role_id?: string;
          tool_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      course_access_control: {
        Row: {
          id: string;
          course_id: string | null;
          role_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id?: string | null;
          role_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string | null;
          role_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          start_time: string;
          end_time: string;
          created_at: string;
          title: string;
          description: string | null;
          location_link: string | null;
          cover_image_url: string | null;
          physical_location: string | null;
          recurrence_pattern: string | null;
          created_by: string;
          is_recurring: boolean | null;
          recurrence_interval: number | null;
          recurrence_day: number | null;
          recurrence_count: number | null;
          recurrence_end_date: string | null;
          parent_event_id: string | null;
        };
        Insert: {
          id?: string;
          start_time: string;
          end_time: string;
          created_at?: string;
          title: string;
          description?: string | null;
          location_link?: string | null;
          cover_image_url?: string | null;
          physical_location?: string | null;
          recurrence_pattern?: string | null;
          created_by: string;
          is_recurring?: boolean | null;
          recurrence_interval?: number | null;
          recurrence_day?: number | null;
          recurrence_count?: number | null;
          recurrence_end_date?: string | null;
          parent_event_id?: string | null;
        };
        Update: {
          id?: string;
          start_time?: string;
          end_time?: string;
          created_at?: string;
          title?: string;
          description?: string | null;
          location_link?: string | null;
          cover_image_url?: string | null;
          physical_location?: string | null;
          recurrence_pattern?: string | null;
          created_by?: string;
          is_recurring?: boolean | null;
          recurrence_interval?: number | null;
          recurrence_day?: number | null;
          recurrence_count?: number | null;
          recurrence_end_date?: string | null;
          parent_event_id?: string | null;
        };
        Relationships: [];
      };
      event_access_control: {
        Row: {
          id: string;
          created_at: string;
          role_id: string;
          event_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          role_id: string;
          event_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          role_id?: string;
          event_id?: string;
        };
        Relationships: [];
      };
      forum_categories: {
        Row: {
          id: string;
          updated_at: string;
          created_at: string;
          slug: string;
          description: string | null;
          name: string;
          icon: string | null;
          order_index: number;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          updated_at?: string;
          created_at?: string;
          slug: string;
          description?: string | null;
          name: string;
          icon?: string | null;
          order_index?: number;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          updated_at?: string;
          created_at?: string;
          slug?: string;
          description?: string | null;
          name?: string;
          icon?: string | null;
          order_index?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      forum_posts: {
        Row: {
          id: string;
          updated_at: string;
          created_at: string;
          is_hidden: boolean;
          is_solution: boolean;
          parent_id: string | null;
          content: string;
          user_id: string;
          topic_id: string;
        };
        Insert: {
          id?: string;
          updated_at?: string;
          created_at?: string;
          is_hidden?: boolean;
          is_solution?: boolean;
          parent_id?: string | null;
          content: string;
          user_id: string;
          topic_id: string;
        };
        Update: {
          id?: string;
          updated_at?: string;
          created_at?: string;
          is_hidden?: boolean;
          is_solution?: boolean;
          parent_id?: string | null;
          content?: string;
          user_id?: string;
          topic_id?: string;
        };
        Relationships: [];
      };
      forum_reactions: {
        Row: {
          id: string;
          created_at: string;
          post_id: string;
          user_id: string;
          reaction_type: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          post_id: string;
          user_id: string;
          reaction_type: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          post_id?: string;
          user_id?: string;
          reaction_type?: string;
        };
        Relationships: [];
      };
      forum_topics: {
        Row: {
          id: string;
          is_locked: boolean;
          is_solved: boolean | null;
          updated_at: string;
          last_activity_at: string;
          created_at: string;
          is_pinned: boolean;
          category_id: string;
          user_id: string;
          view_count: number;
          title: string;
          content: string;
          reply_count: number;
        };
        Insert: {
          id?: string;
          is_locked?: boolean;
          is_solved?: boolean | null;
          updated_at?: string;
          last_activity_at?: string;
          created_at?: string;
          is_pinned?: boolean;
          category_id: string;
          user_id: string;
          view_count?: number;
          title: string;
          content: string;
          reply_count?: number;
        };
        Update: {
          id?: string;
          is_locked?: boolean;
          is_solved?: boolean | null;
          updated_at?: string;
          last_activity_at?: string;
          created_at?: string;
          is_pinned?: boolean;
          category_id?: string;
          user_id?: string;
          view_count?: number;
          title?: string;
          content?: string;
          reply_count?: number;
        };
        Relationships: [];
      };
      implementation_checkpoints: {
        Row: {
          id: string;
          solution_id: string | null;
          checkpoint_order: number;
          created_at: string;
          description: string;
        };
        Insert: {
          id?: string;
          solution_id?: string | null;
          checkpoint_order: number;
          created_at?: string;
          description: string;
        };
        Update: {
          id?: string;
          solution_id?: string | null;
          checkpoint_order?: number;
          created_at?: string;
          description?: string;
        };
        Relationships: [];
      };
      invites: {
        Row: {
          id: string;
          email: string;
          role_id: string;
          token: string;
          expires_at: string;
          used_at: string | null;
          created_at: string;
          created_by: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          role_id: string;
          token: string;
          expires_at: string;
          used_at?: string | null;
          created_at?: string;
          created_by: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          role_id?: string;
          token?: string;
          expires_at?: string;
          used_at?: string | null;
          created_at?: string;
          created_by?: string;
          notes?: string | null;
        };
        Relationships: [];
      };
      learning_courses: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          cover_image_url: string | null;
          published: boolean | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          order_index: number | null;
          slug: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          cover_image_url?: string | null;
          published?: boolean | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          order_index?: number | null;
          slug: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          cover_image_url?: string | null;
          published?: boolean | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          order_index?: number | null;
          slug?: string;
        };
        Relationships: [];
      };
      learning_modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          cover_image_url: string | null;
          published: boolean | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string | null;
          cover_image_url?: string | null;
          published?: boolean | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string | null;
          cover_image_url?: string | null;
          published?: boolean | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      learning_lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          description: string | null;
          content: Record<string, any> | null;
          cover_image_url: string | null;
          published: boolean | null;
          order_index: number;
          estimated_time_minutes: number | null;
          difficulty_level: string | null;
          ai_assistant_enabled: boolean | null;
          ai_assistant_prompt: string | null;
          ai_assistant_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          title: string;
          description?: string | null;
          content?: Record<string, any> | null;
          cover_image_url?: string | null;
          published?: boolean | null;
          order_index?: number;
          estimated_time_minutes?: number | null;
          difficulty_level?: string | null;
          ai_assistant_enabled?: boolean | null;
          ai_assistant_prompt?: string | null;
          ai_assistant_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string;
          title?: string;
          description?: string | null;
          content?: Record<string, any> | null;
          cover_image_url?: string | null;
          published?: boolean | null;
          order_index?: number;
          estimated_time_minutes?: number | null;
          difficulty_level?: string | null;
          ai_assistant_enabled?: boolean | null;
          ai_assistant_prompt?: string | null;
          ai_assistant_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      learning_lesson_videos: {
        Row: {
          id: string;
          lesson_id: string;
          title: string;
          description: string | null;
          url: string;
          video_type: string | null;
          video_id: string | null;
          thumbnail_url: string | null;
          duration_seconds: number | null;
          order_index: number;
          video_file_path: string | null;
          video_file_name: string | null;
          file_size_bytes: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          title: string;
          description?: string | null;
          url: string;
          video_type?: string | null;
          video_id?: string | null;
          thumbnail_url?: string | null;
          duration_seconds?: number | null;
          order_index?: number;
          video_file_path?: string | null;
          video_file_name?: string | null;
          file_size_bytes?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          title?: string;
          description?: string | null;
          url?: string;
          video_type?: string | null;
          video_id?: string | null;
          thumbnail_url?: string | null;
          duration_seconds?: number | null;
          order_index?: number;
          video_file_path?: string | null;
          video_file_name?: string | null;
          file_size_bytes?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      learning_comments: {
        Row: {
          id: string;
          lesson_id: string;
          user_id: string;
          content: string;
          parent_id: string | null;
          is_hidden: boolean;
          likes_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          user_id: string;
          content: string;
          parent_id?: string | null;
          is_hidden?: boolean;
          likes_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          user_id?: string;
          content?: string;
          parent_id?: string | null;
          is_hidden?: boolean;
          likes_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      learning_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          progress_percentage: number | null;
          video_progress: Record<string, any> | null;
          started_at: string;
          completed_at: string | null;
          last_position_seconds: number | null;
          updated_at: string;
          created_at: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          progress_percentage?: number | null;
          video_progress?: Record<string, any> | null;
          started_at?: string;
          completed_at?: string | null;
          last_position_seconds?: number | null;
          updated_at?: string;
          created_at?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          progress_percentage?: number | null;
          video_progress?: Record<string, any> | null;
          started_at?: string;
          completed_at?: string | null;
          last_position_seconds?: number | null;
          updated_at?: string;
          created_at?: string;
          notes?: string | null;
        };
        Relationships: [];
      };
      learning_resources: {
        Row: {
          id: string;
          lesson_id: string | null;
          name: string;
          description: string | null;
          file_url: string;
          file_type: string | null;
          file_size_bytes: number | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id?: string | null;
          name: string;
          description?: string | null;
          file_url: string;
          file_type?: string | null;
          file_size_bytes?: number | null;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string | null;
          name?: string;
          description?: string | null;
          file_url?: string;
          file_type?: string | null;
          file_size_bytes?: number | null;
          order_index?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      modules: {
        Row: {
          id: string;
          solution_id: string;
          title: string;
          type: string;
          content: Record<string, any>;
          module_order: number;
          estimated_time_minutes: number | null;
          metrics: Record<string, any> | null;
          certificate_template: Record<string, any> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          solution_id: string;
          title: string;
          type: string;
          content: Record<string, any>;
          module_order: number;
          estimated_time_minutes?: number | null;
          metrics?: Record<string, any> | null;
          certificate_template?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          solution_id?: string;
          title?: string;
          type?: string;
          content?: Record<string, any>;
          module_order?: number;
          estimated_time_minutes?: number | null;
          metrics?: Record<string, any> | null;
          certificate_template?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      permission_definitions: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          category: string | null;
          is_system: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          category?: string | null;
          is_system?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          category?: string | null;
          is_system?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          company_name: string | null;
          industry: string | null;
          role: string | null;
          role_id: string | null;
          created_at: string;
          updated_at: string;
          phone: string | null;
          instagram: string | null;
          linkedin: string | null;
          country: string | null;
          state: string | null;
          city: string | null;
          company_website: string | null;
          current_position: string | null;
          company_sector: string | null;
          company_size: string | null;
          annual_revenue: string | null;
          primary_goal: string | null;
          business_challenges: string[] | null;
          ai_knowledge_level: number | null;
          nps_score: number | null;
          weekly_availability: string | null;
          networking_interests: string[] | null;
          phone_country_code: string | null;
          onboarding_completed: boolean | null;
          onboarding_completed_at: string | null;
          referrals_count: number;
          successful_referrals_count: number;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          company_name?: string | null;
          industry?: string | null;
          role?: string | null;
          role_id?: string | null;
          created_at?: string;
          updated_at?: string;
          phone?: string | null;
          instagram?: string | null;
          linkedin?: string | null;
          country?: string | null;
          state?: string | null;
          city?: string | null;
          company_website?: string | null;
          current_position?: string | null;
          company_sector?: string | null;
          company_size?: string | null;
          annual_revenue?: string | null;
          primary_goal?: string | null;
          business_challenges?: string[] | null;
          ai_knowledge_level?: number | null;
          nps_score?: number | null;
          weekly_availability?: string | null;
          networking_interests?: string[] | null;
          phone_country_code?: string | null;
          onboarding_completed?: boolean | null;
          onboarding_completed_at?: string | null;
          referrals_count?: number;
          successful_referrals_count?: number;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          company_name?: string | null;
          industry?: string | null;
          role?: string | null;
          role_id?: string | null;
          created_at?: string;
          updated_at?: string;
          phone?: string | null;
          instagram?: string | null;
          linkedin?: string | null;
          country?: string | null;
          state?: string | null;
          city?: string | null;
          company_website?: string | null;
          current_position?: string | null;
          company_sector?: string | null;
          company_size?: string | null;
          annual_revenue?: string | null;
          primary_goal?: string | null;
          business_challenges?: string[] | null;
          ai_knowledge_level?: number | null;
          nps_score?: number | null;
          weekly_availability?: string | null;
          networking_interests?: string[] | null;
          phone_country_code?: string | null;
          onboarding_completed?: boolean | null;
          onboarding_completed_at?: string | null;
          referrals_count?: number;
          successful_referrals_count?: number;
        };
        Relationships: [];
      };
      progress: {
        Row: {
          id: string;
          user_id: string;
          solution_id: string;
          is_completed: boolean;
          completion_percentage: number;
          current_module_id: string | null;
          started_at: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          solution_id: string;
          is_completed?: boolean;
          completion_percentage?: number;
          current_module_id?: string | null;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          solution_id?: string;
          is_completed?: boolean;
          completion_percentage?: number;
          current_module_id?: string | null;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: {
          id: string;
          role_id: string;
          permission_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          role_id: string;
          permission_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          role_id?: string;
          permission_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      solutions: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          difficulty: string;
          estimated_time: number;
          created_at: string;
          updated_at: string;
          published: boolean;
          cover_image_url: string | null;
          video_url: string | null;
          tags: string[] | null;
          requirements: string[] | null;
          learning_objectives: string[] | null;
          target_audience: string[] | null;
          slug: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: string;
          difficulty: string;
          estimated_time: number;
          created_at?: string;
          updated_at?: string;
          published?: boolean;
          cover_image_url?: string | null;
          video_url?: string | null;
          tags?: string[] | null;
          requirements?: string[] | null;
          learning_objectives?: string[] | null;
          target_audience?: string[] | null;
          slug?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: string;
          difficulty?: string;
          estimated_time?: number;
          created_at?: string;
          updated_at?: string;
          published?: boolean;
          cover_image_url?: string | null;
          video_url?: string | null;
          tags?: string[] | null;
          requirements?: string[] | null;
          learning_objectives?: string[] | null;
          target_audience?: string[] | null;
          slug?: string | null;
        };
        Relationships: [];
      };
      solution_resources: {
        Row: {
          id: string;
          solution_id: string;
          title: string;
          description: string | null;
          resource_type: string;
          resource_url: string;
          file_size: number | null;
          order_index: number;
          is_required: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          solution_id: string;
          title: string;
          description?: string | null;
          resource_type: string;
          resource_url: string;
          file_size?: number | null;
          order_index?: number;
          is_required?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          solution_id?: string;
          title?: string;
          description?: string | null;
          resource_type?: string;
          resource_url?: string;
          file_size?: number | null;
          order_index?: number;
          is_required?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      solution_tools: {
        Row: {
          id: string;
          solution_id: string;
          tool_name: string;
          tool_url: string;
          is_required: boolean;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          solution_id: string;
          tool_name: string;
          tool_url: string;
          is_required?: boolean;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          solution_id?: string;
          tool_name?: string;
          tool_url?: string;
          is_required?: boolean;
          order_index?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      tools: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          subcategory: string | null;
          pricing_model: string | null;
          official_url: string | null;
          logo_url: string | null;
          rating: number | null;
          review_count: number | null;
          is_featured: boolean;
          has_member_benefit: boolean;
          benefit_type: string | null;
          benefit_description: string | null;
          benefit_link: string | null;
          tutorial_video_url: string | null;
          created_at: string;
          updated_at: string;
          tags: string[] | null;
          features: string[] | null;
          use_cases: string[] | null;
          integration_options: string[] | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category: string;
          subcategory?: string | null;
          pricing_model?: string | null;
          official_url?: string | null;
          logo_url?: string | null;
          rating?: number | null;
          review_count?: number | null;
          is_featured?: boolean;
          has_member_benefit?: boolean;
          benefit_type?: string | null;
          benefit_description?: string | null;
          benefit_link?: string | null;
          tutorial_video_url?: string | null;
          created_at?: string;
          updated_at?: string;
          tags?: string[] | null;
          features?: string[] | null;
          use_cases?: string[] | null;
          integration_options?: string[] | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string;
          subcategory?: string | null;
          pricing_model?: string | null;
          official_url?: string | null;
          logo_url?: string | null;
          rating?: number | null;
          review_count?: number | null;
          is_featured?: boolean;
          has_member_benefit?: boolean;
          benefit_type?: string | null;
          benefit_description?: string | null;
          benefit_link?: string | null;
          tutorial_video_url?: string | null;
          created_at?: string;
          updated_at?: string;
          tags?: string[] | null;
          features?: string[] | null;
          use_cases?: string[] | null;
          integration_options?: string[] | null;
        };
        Relationships: [];
      };
      user_checklists: {
        Row: {
          id: string;
          user_id: string;
          solution_id: string;
          checkpoint_id: string;
          is_completed: boolean;
          completed_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          solution_id: string;
          checkpoint_id: string;
          is_completed?: boolean;
          completed_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          solution_id?: string;
          checkpoint_id?: string;
          is_completed?: boolean;
          completed_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          permissions: Record<string, any> | null;
          is_system: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          permissions?: Record<string, any> | null;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          permissions?: Record<string, any> | null;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      onboarding_sync: {
        Row: {
          id: string;
          user_id: string;
          data: any;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          data: any;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          data?: any;
          updated_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      onboarding_analytics: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          step_number?: number;
          field_name?: string;
          error_message?: string;
          metadata: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: string;
          step_number?: number;
          field_name?: string;
          error_message?: string;
          metadata?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          step_number?: number;
          field_name?: string;
          error_message?: string;
          metadata?: any;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      audit_role_assignments: {
        Args: Record<string, never>;
        Returns: {
          user_id: string;
          email: string;
          name: string | null;
          role_name: string | null;
          assigned_at: string;
          issues: string[] | null;
        }[];
      };
      can_access_benefit: {
        Args: {
          user_id: string;
          tool_id: string;
        };
        Returns: boolean;
      };
      can_access_course: {
        Args: {
          user_id: string;
          course_id: string;
        };
        Returns: boolean;
      };
      check_solution_certificate_eligibility: {
        Args: {
          p_user_id: string;
          p_solution_id: string;
        };
        Returns: boolean;
      };
      create_invite: {
        Args: {
          p_email: string;
          p_role_id: string;
          p_expires_in?: string;
          p_notes?: string;
        };
        Returns: Record<string, any>;
      };
      delete_forum_post: {
        Args: {
          post_id: string;
        };
        Returns: Record<string, any>;
      };
      delete_forum_topic: {
        Args: {
          topic_id: string;
        };
        Returns: Record<string, any>;
      };
      get_current_user_role: {
        Args: Record<string, never>;
        Returns: string;
      };
      get_user_profile_safe: {
        Args: {
          p_user_id?: string;
        };
        Returns: Record<string, any>;
      };
      get_users_with_roles: {
        Args: {
          limit_count?: number;
          offset_count?: number;
          search_query?: string;
        };
        Returns: {
          id: string;
          email: string;
          name: string;
          avatar_url: string;
          role: string;
          role_id: string;
          user_roles: Record<string, any>;
          company_name: string;
          industry: string;
          created_at: string;
        }[];
      };
      increment_topic_replies: {
        Args: {
          topic_id: string;
        };
        Returns: void;
      };
      increment_topic_views: {
        Args: {
          topic_id: string;
        };
        Returns: void;
      };
      sync_profile_roles: {
        Args: Record<string, never>;
        Returns: Record<string, any>;
      };
      use_invite: {
        Args: {
          invite_token: string;
          user_id: string;
        };
        Returns: {
          status: string;
          message: string;
        };
      };
      validate_profile_roles: {
        Args: Record<string, never>;
        Returns: {
          user_id: string;
          email: string;
          current_role: string | null;
          expected_role: string | null;
          is_valid: boolean;
          needs_update: boolean;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
