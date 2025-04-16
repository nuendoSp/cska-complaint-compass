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
      complaints: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string
          status: string
          location_id: string
          user_id: string
          submittedAt?: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description: string
          status?: string
          location_id: string
          user_id: string
          submittedAt?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string
          status?: string
          location_id?: string
          user_id?: string
          submittedAt?: string
        }
      }
      responses: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          complaint_id: string
          user_id: string
          message: string
          respondedAt: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          complaint_id: string
          user_id: string
          message: string
          respondedAt: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          complaint_id?: string
          user_id?: string
          message?: string
          respondedAt?: string
        }
      }
      locations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          address: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          address: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          address?: string
        }
      }
      content: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          key: string
          value: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          key: string
          value: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          key?: string
          value?: Json
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 