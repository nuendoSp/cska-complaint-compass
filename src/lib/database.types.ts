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
      assignees: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          email: string
          role: 'admin' | 'support'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          email: string
          role?: 'admin' | 'support'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          email?: string
          role?: 'admin' | 'support'
        }
      }
      complaints: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string | null
          category: 'other' | 'technical' | 'billing' | 'service' | 'suggestion'
          status: 'new' | 'in_progress' | 'resolved' | 'rejected'
          rating: number | null
          attachments: string[]
          submitter_email: string
          submitter_name: string
          assignee_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description?: string | null
          category?: 'other' | 'technical' | 'billing' | 'service' | 'suggestion'
          status?: 'new' | 'in_progress' | 'resolved' | 'rejected'
          rating?: number | null
          attachments?: string[]
          submitter_email: string
          submitter_name: string
          assignee_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string | null
          category?: 'other' | 'technical' | 'billing' | 'service' | 'suggestion'
          status?: 'new' | 'in_progress' | 'resolved' | 'rejected'
          rating?: number | null
          attachments?: string[]
          submitter_email?: string
          submitter_name?: string
          assignee_id?: string | null
        }
      }
      complaint_responses: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          complaint_id: string
          assignee_id: string
          text: string
          attachments: Json
          respondedat: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          complaint_id: string
          assignee_id: string
          text: string
          attachments?: Json
          respondedat?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          complaint_id?: string
          assignee_id?: string
          text?: string
          attachments?: Json
          respondedat?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_migration: {
        Args: {
          sql_content: string
        }
        Returns: void
      }
    }
    Enums: {
      complaint_category: 'other' | 'technical' | 'billing' | 'service' | 'suggestion'
      complaint_status: 'new' | 'in_progress' | 'resolved' | 'rejected'
      user_role: 'admin' | 'support'
    }
  }
} 