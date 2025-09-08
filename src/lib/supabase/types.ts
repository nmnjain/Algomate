// Database type definitions for TypeScript support
export interface Database {
  public: {
    Tables: {
      user_platform_data: {
        Row: {
          id: string
          user_id: string
          platform: string
          data: any
          last_updated: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: string
          data: any
          last_updated?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          data?: any
          last_updated?: string
        }
      }
      user_platform_connections: {
        Row: {
          id: string
          user_id: string
          platform: string
          connected_at: string
          last_sync_at: string | null
          connection_data: any | null
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          platform: string
          connected_at?: string
          last_sync_at?: string | null
          connection_data?: any | null
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          connected_at?: string
          last_sync_at?: string | null
          connection_data?: any | null
          is_active?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
