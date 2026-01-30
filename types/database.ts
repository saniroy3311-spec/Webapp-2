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
      profiles: {
        Row: {
          id: string
          preferred_currency: string | null
          timezone: string | null
          theme: string | null
          created_at: string
        }
        Insert: {
          id: string
          preferred_currency?: string | null
          timezone?: string | null
          theme?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          preferred_currency?: string | null
          timezone?: string | null
          theme?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      markets: {
        Row: {
          id: string
          user_id: string
          name: string
          lot_size: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          lot_size: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          lot_size?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "markets_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      setups: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "setups_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      mistakes: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mistakes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      trades: {
        Row: {
          id: string
          user_id: string
          trade_date: string
          market_id: string | null
          setup_id: string | null
          mistake_id: string | null
          direction: 'LONG' | 'SHORT' | null
          trade_type: 'INTRADAY' | 'SWING' | null
          entry_price: number
          exit_price: number
          quantity: number
          lots: number
          lot_size_snapshot: number
          sl_price: number | null
          target_price: number | null
          risk_amount: number | null
          rr: number | null
          gross_pnl: number
          brokerage: number | null
          taxes: number | null
          pnl_after_expense: number | null
          emotion: string | null
          followed_rules: boolean | null
          time_slot: string | null
          notes: string | null
          trade_image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          trade_date: string
          market_id?: string | null
          setup_id?: string | null
          mistake_id?: string | null
          direction?: 'LONG' | 'SHORT' | null
          trade_type?: 'INTRADAY' | 'SWING' | null
          entry_price: number
          exit_price: number
          quantity: number
          lots: number
          lot_size_snapshot: number
          sl_price?: number | null
          target_price?: number | null
          risk_amount?: number | null
          rr?: number | null
          gross_pnl: number
          brokerage?: number | null
          taxes?: number | null
          pnl_after_expense?: number | null
          emotion?: string | null
          followed_rules?: boolean | null
          time_slot?: string | null
          notes?: string | null
          trade_image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          trade_date?: string
          market_id?: string | null
          setup_id?: string | null
          mistake_id?: string | null
          direction?: 'LONG' | 'SHORT' | null
          trade_type?: 'INTRADAY' | 'SWING' | null
          entry_price?: number
          exit_price?: number
          quantity?: number
          lots?: number
          lot_size_snapshot?: number
          sl_price?: number | null
          target_price?: number | null
          risk_amount?: number | null
          rr?: number | null
          gross_pnl?: number
          brokerage?: number | null
          taxes?: number | null
          pnl_after_expense?: number | null
          emotion?: string | null
          followed_rules?: boolean | null
          time_slot?: string | null
          notes?: string | null
          trade_image_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_market_id_fkey"
            columns: ["market_id"]
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_mistake_id_fkey"
            columns: ["mistake_id"]
            referencedRelation: "mistakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_setup_id_fkey"
            columns: ["setup_id"]
            referencedRelation: "setups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
