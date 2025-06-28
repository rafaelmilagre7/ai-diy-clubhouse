export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      admin_communications: {
        Row: {
          id: string
          title: string
          content: string
          type: string
          priority: string
          target_roles: string[] | null
          created_by: string
          created_at: string
          updated_at: string
          is_active: boolean
          scheduled_for: string | null
          sent_at: string | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          type?: string
          priority?: string
          target_roles?: string[] | null
          created_by: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          scheduled_for?: string | null
          sent_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          type?: string
          priority?: string
          target_roles?: string[] | null
          created_by?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          scheduled_for?: string | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_communications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      analytics: {
        Row: {
          id: string
          user_id: string
          event_type: string
          event_data: Json
          created_at: string
          session_id: string | null
          page_url: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          user_id: string
          event_type: string
          event_data?: Json
          created_at?: string
          session_id?: string | null
          page_url?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: string
          event_data?: Json
          created_at?: string
          session_id?: string | null
          page_url?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          table_name: string | null
          record_id: string | null
          old_values: Json | null
          new_values: Json | null
          created_at: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          table_name?: string | null
          record_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          created_at?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          table_name?: string | null
          record_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          created_at?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      benefit_access_control: {
        Row: {
          id: string
          tool_id: string
          role_id: string
          created_at: string
        }
        Insert: {
          id?: string
          tool_id: string
          role_id: string
          created_at?: string
        }
        Update: {
          id?: string
          tool_id?: string
          role_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "benefit_access_control_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_access_control_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          }
        ]
      }
      course_access_control: {
        Row: {
          id: string
          course_id: string
          role_id: string
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          role_id: string
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          role_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_access_control_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "learning_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_access_control_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          }
        ]
      }
      event_access_control: {
        Row: {
          id: string
          event_id: string
          role_id: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          role_id: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          role_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_access_control_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_access_control_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          }
        ]
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          event_date: string
          location: string | null
          max_participants: number | null
          registration_deadline: string | null
          created_at: string
          updated_at: string
          is_active: boolean
          event_type: string
          price: number | null
          currency: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          event_date: string
          location?: string | null
          max_participants?: number | null
          registration_deadline?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
          event_type?: string
          price?: number | null
          currency?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          event_date?: string
          location?: string | null
          max_participants?: number | null
          registration_deadline?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
          event_type?: string
          price?: number | null
          currency?: string | null
        }
        Relationships: []
      }
      forum_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string | null
          icon: string | null
          order_index: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string | null
          icon?: string | null
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string | null
          icon?: string | null
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          id: string
          topic_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
          is_deleted: boolean
          parent_post_id: string | null
        }
        Insert: {
          id?: string
          topic_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
          is_deleted?: boolean
          parent_post_id?: string | null
        }
        Update: {
          id?: string
          topic_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
          is_deleted?: boolean
          parent_post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_parent_post_id_fkey"
            columns: ["parent_post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          }
        ]
      }
      forum_topics: {
        Row: {
          id: string
          category_id: string
          user_id: string
          title: string
          content: string
          views_count: number
          replies_count: number
          is_pinned: boolean
          is_locked: boolean
          is_deleted: boolean
          created_at: string
          updated_at: string
          last_activity_at: string
        }
        Insert: {
          id?: string
          category_id: string
          user_id: string
          title: string
          content: string
          views_count?: number
          replies_count?: number
          is_pinned?: boolean
          is_locked?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
          last_activity_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          user_id?: string
          title?: string
          content?: string
          views_count?: number
          replies_count?: number
          is_pinned?: boolean
          is_locked?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
          last_activity_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_topics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      implementation_checkpoints: {
        Row: {
          id: string
          solution_id: string
          title: string
          description: string | null
          order_index: number
          is_completed: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          solution_id: string
          title: string
          description?: string | null
          order_index?: number
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          solution_id?: string
          title?: string
          description?: string | null
          order_index?: number
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "implementation_checkpoints_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          }
        ]
      }
      invites: {
        Row: {
          id: string
          token: string
          email: string | null
          role_id: string
          created_by: string
          created_at: string
          expires_at: string
          used_at: string | null
          used_by: string | null
          is_active: boolean
          max_uses: number
          current_uses: number
        }
        Insert: {
          id?: string
          token: string
          email?: string | null
          role_id: string
          created_by: string
          created_at?: string
          expires_at: string
          used_at?: string | null
          used_by?: string | null
          is_active?: boolean
          max_uses?: number
          current_uses?: number
        }
        Update: {
          id?: string
          token?: string
          email?: string | null
          role_id?: string
          created_by?: string
          created_at?: string
          expires_at?: string
          used_at?: string | null
          used_by?: string | null
          is_active?: boolean
          max_uses?: number
          current_uses?: number
        }
        Relationships: [
          {
            foreignKeyName: "invites_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_used_by_fkey"
            columns: ["used_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      learning_comments: {
        Row: {
          id: string
          lesson_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
          is_deleted: boolean
          parent_comment_id: string | null
        }
        Insert: {
          id?: string
          lesson_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
          is_deleted?: boolean
          parent_comment_id?: string | null
        }
        Update: {
          id?: string
          lesson_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
          is_deleted?: boolean
          parent_comment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_comments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "learning_comments"
            referencedColumns: ["id"]
          }
        ]
      }
      learning_courses: {
        Row: {
          id: string
          title: string
          description: string | null
          thumbnail_url: string | null
          difficulty_level: string
          estimated_duration_hours: number | null
          is_published: boolean
          created_at: string
          updated_at: string
          order_index: number
          category: string | null
          tags: string[] | null
          instructor_id: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          thumbnail_url?: string | null
          difficulty_level?: string
          estimated_duration_hours?: number | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
          order_index?: number
          category?: string | null
          tags?: string[] | null
          instructor_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          thumbnail_url?: string | null
          difficulty_level?: string
          estimated_duration_hours?: number | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
          order_index?: number
          category?: string | null
          tags?: string[] | null
          instructor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      learning_lessons: {
        Row: {
          id: string
          module_id: string
          title: string
          description: string | null
          content: string | null
          order_index: number
          is_published: boolean
          created_at: string
          updated_at: string
          estimated_duration_minutes: number | null
          lesson_type: string
          resources: Json | null
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          description?: string | null
          content?: string | null
          order_index?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
          estimated_duration_minutes?: number | null
          lesson_type?: string
          resources?: Json | null
        }
        Update: {
          id?: string
          module_id?: string
          title?: string
          description?: string | null
          content?: string | null
          order_index?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
          estimated_duration_minutes?: number | null
          lesson_type?: string
          resources?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          }
        ]
      }
      learning_lesson_videos: {
        Row: {
          id: string
          lesson_id: string
          title: string
          description: string | null
          url: string
          thumbnail_url: string | null
          duration_seconds: number
          created_at: string
          order_index: number
          video_type: string
          file_size_bytes: number | null
          video_file_path: string | null
          video_file_name: string | null
          video_id: string | null
        }
        Insert: {
          id?: string
          lesson_id: string
          title: string
          description?: string | null
          url: string
          thumbnail_url?: string | null
          duration_seconds?: number
          created_at?: string
          order_index?: number
          video_type?: string
          file_size_bytes?: number | null
          video_file_path?: string | null
          video_file_name?: string | null
          video_id?: string | null
        }
        Update: {
          id?: string
          lesson_id?: string
          title?: string
          description?: string | null
          url?: string
          thumbnail_url?: string | null
          duration_seconds?: number
          created_at?: string
          order_index?: number
          video_type?: string
          file_size_bytes?: number | null
          video_file_path?: string | null
          video_file_name?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_lesson_videos_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons"
            referencedColumns: ["id"]
          }
        ]
      }
      learning_modules: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          order_index: number
          is_published: boolean
          created_at: string
          updated_at: string
          estimated_duration_hours: number | null
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          order_index?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
          estimated_duration_hours?: number | null
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          order_index?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
          estimated_duration_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "learning_courses"
            referencedColumns: ["id"]
          }
        ]
      }
      learning_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          progress_percentage: number
          video_progress: Json
          started_at: string
          completed_at: string | null
          last_position_seconds: number | null
          updated_at: string
          created_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          progress_percentage?: number
          video_progress?: Json
          started_at?: string
          completed_at?: string | null
          last_position_seconds?: number | null
          updated_at?: string
          created_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          progress_percentage?: number
          video_progress?: Json
          started_at?: string
          completed_at?: string | null
          last_position_seconds?: number | null
          updated_at?: string
          created_at?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons"
            referencedColumns: ["id"]
          }
        ]
      }
      learning_resources: {
        Row: {
          id: string
          lesson_id: string
          title: string
          description: string | null
          resource_type: string
          file_url: string | null
          external_url: string | null
          file_size_bytes: number | null
          file_name: string | null
          created_at: string
          updated_at: string
          order_index: number
        }
        Insert: {
          id?: string
          lesson_id: string
          title: string
          description?: string | null
          resource_type: string
          file_url?: string | null
          external_url?: string | null
          file_size_bytes?: number | null
          file_name?: string | null
          created_at?: string
          updated_at?: string
          order_index?: number
        }
        Update: {
          id?: string
          lesson_id?: string
          title?: string
          description?: string | null
          resource_type?: string
          file_url?: string | null
          external_url?: string | null
          file_size_bytes?: number | null
          file_name?: string | null
          created_at?: string
          updated_at?: string
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "learning_resources_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons"
            referencedColumns: ["id"]
          }
        ]
      }
      modules: {
        Row: {
          id: string
          title: string
          description: string | null
          order_index: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          email_enabled: boolean
          whatsapp_enabled: boolean
          admin_communications_inapp: boolean
          admin_communications_email: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_enabled?: boolean
          whatsapp_enabled?: boolean
          admin_communications_inapp?: boolean
          admin_communications_email?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_enabled?: boolean
          whatsapp_enabled?: boolean
          admin_communications_inapp?: boolean
          admin_communications_email?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      permission_definitions: {
        Row: {
          id: string
          name: string
          description: string | null
          resource: string
          action: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          resource: string
          action: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          resource?: string
          action?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          company_name: string | null
          industry: string | null
          role_id: string | null
          role: string | null
          created_at: string
          updated_at: string
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          phone: string | null
          instagram: string | null
          linkedin: string | null
          state: string | null
          city: string | null
          company_website: string | null
          company_size: string | null
          annual_revenue: string | null
          ai_knowledge_level: number | null
          business_challenges: string[] | null
          user_roles?: {
            id: string
            name: string
            description?: string | null
            permissions?: Json
            is_system?: boolean
          } | null
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          avatar_url?: string | null
          company_name?: string | null
          industry?: string | null
          role_id?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          phone?: string | null
          instagram?: string | null
          linkedin?: string | null
          state?: string | null
          city?: string | null
          company_website?: string | null
          company_size?: string | null
          annual_revenue?: string | null
          ai_knowledge_level?: number | null
          business_challenges?: string[] | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          company_name?: string | null
          industry?: string | null
          role_id?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          phone?: string | null
          instagram?: string | null
          linkedin?: string | null
          state?: string | null
          city?: string | null
          company_website?: string | null
          company_size?: string | null
          annual_revenue?: string | null
          ai_knowledge_level?: number | null
          business_challenges?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          }
        ]
      }
      progress: {
        Row: {
          id: string
          user_id: string
          solution_id: string
          status: string
          progress_percentage: number
          started_at: string
          completed_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          solution_id: string
          status?: string
          progress_percentage?: number
          started_at?: string
          completed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          solution_id?: string
          status?: string
          progress_percentage?: number
          started_at?: string
          completed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          }
        ]
      }
      role_permissions: {
        Row: {
          id: string
          role_id: string
          permission_id: string
          created_at: string
        }
        Insert: {
          id?: string
          role_id: string
          permission_id: string
          created_at?: string
        }
        Update: {
          id?: string
          role_id?: string
          permission_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permission_definitions"
            referencedColumns: ["id"]
          }
        ]
      }
      solution_resources: {
        Row: {
          id: string
          solution_id: string
          title: string
          description: string | null
          resource_type: string
          file_url: string | null
          external_url: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          solution_id: string
          title: string
          description?: string | null
          resource_type: string
          file_url?: string | null
          external_url?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          solution_id?: string
          title?: string
          description?: string | null
          resource_type?: string
          file_url?: string | null
          external_url?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "solution_resources_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          }
        ]
      }
      solutions: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          difficulty_level: string
          estimated_time_hours: number | null
          roi_potential: string | null
          implementation_steps: Json | null
          required_tools: string[] | null
          tags: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
          order_index: number
          thumbnail_url: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: string
          difficulty_level?: string
          estimated_time_hours?: number | null
          roi_potential?: string | null
          implementation_steps?: Json | null
          required_tools?: string[] | null
          tags?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          order_index?: number
          thumbnail_url?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string
          difficulty_level?: string
          estimated_time_hours?: number | null
          roi_potential?: string | null
          implementation_steps?: Json | null
          required_tools?: string[] | null
          tags?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          order_index?: number
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      tools: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          url: string | null
          logo_url: string | null
          pricing_info: Json | null
          features: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
          order_index: number
          benefit_title: string | null
          benefit_description: string | null
          benefit_url: string | null
          benefit_type: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          url?: string | null
          logo_url?: string | null
          pricing_info?: Json | null
          features?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          order_index?: number
          benefit_title?: string | null
          benefit_description?: string | null
          benefit_url?: string | null
          benefit_type?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          url?: string | null
          logo_url?: string | null
          pricing_info?: Json | null
          features?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          order_index?: number
          benefit_title?: string | null
          benefit_description?: string | null
          benefit_url?: string | null
          benefit_type?: string | null
        }
        Relationships: []
      }
      user_checklists: {
        Row: {
          id: string
          user_id: string
          solution_id: string
          checkpoint_id: string
          is_completed: boolean
          completed_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          solution_id: string
          checkpoint_id: string
          is_completed?: boolean
          completed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          solution_id?: string
          checkpoint_id?: string
          is_completed?: boolean
          completed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_checklists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_checklists_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_checklists_checkpoint_id_fkey"
            columns: ["checkpoint_id"]
            isOneToOne: false
            referencedRelation: "implementation_checkpoints"
            referencedColumns: ["id"]
          }
        ]
      }
      user_roles: {
        Row: {
          id: string
          name: string
          description: string | null
          permissions: Json | null
          is_system: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          permissions?: Json | null
          is_system?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          permissions?: Json | null
          is_system?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      audit_role_assignments: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          user_email: string
          role_name: string
          role_assigned_at: string
          issues: string[]
        }[]
      }
      create_storage_public_policy: {
        Args: {
          bucket_name: string
        }
        Returns: boolean
      }
      delete_forum_post: {
        Args: {
          post_id: string
          user_id: string
        }
        Returns: boolean
      }
      delete_forum_topic: {
        Args: {
          topic_id: string
          user_id: string
        }
        Returns: boolean
      }
      get_user_role_name: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      increment_topic_replies: {
        Args: {
          topic_id: string
        }
        Returns: boolean
      }
      increment_topic_views: {
        Args: {
          topic_id: string
        }
        Returns: boolean
      }
      sync_profile_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          synced_count: number
          errors: string[]
        }
      }
      use_invite: {
        Args: {
          invite_token: string
          user_id: string
        }
        Returns: {
          status: string
          message: string
        }
      }
      validate_profile_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          user_email: string
          current_role: string
          expected_role: string
          is_valid: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
