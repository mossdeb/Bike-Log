export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bikes: {
        Row: {
          active: boolean
          brand: string | null
          color: string | null
          created_at: string
          frame_size: string | null
          id: string
          image_url: string | null
          model: string | null
          name: string
          notes: string | null
          purchase_date: string | null
          serial_number: string | null
          strava_gear_id: string | null
          total_hours: number | null
          total_km: number | null
          type: string | null
          updated_at: string
          usage_updated_at: string | null
          user_id: string
          warranty: string | null
          wheel_size: string | null
          year: number | null
        }
        Insert: {
          active?: boolean
          brand?: string | null
          color?: string | null
          created_at?: string
          frame_size?: string | null
          id?: string
          image_url?: string | null
          model?: string | null
          name: string
          notes?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          strava_gear_id?: string | null
          total_hours?: number | null
          total_km?: number | null
          type?: string | null
          updated_at?: string
          usage_updated_at?: string | null
          user_id: string
          warranty?: string | null
          wheel_size?: string | null
          year?: number | null
        }
        Update: {
          active?: boolean
          brand?: string | null
          color?: string | null
          created_at?: string
          frame_size?: string | null
          id?: string
          image_url?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          strava_gear_id?: string | null
          total_hours?: number | null
          total_km?: number | null
          type?: string | null
          updated_at?: string
          usage_updated_at?: string | null
          user_id?: string
          warranty?: string | null
          wheel_size?: string | null
          year?: number | null
        }
        Relationships: []
      }
      components: {
        Row: {
          active: boolean
          bike_hours_at_install: number | null
          bike_id: string
          bike_km_at_install: number | null
          brand: string | null
          category: string | null
          created_at: string
          id: string
          install_date: string | null
          interval_type: string | null
          interval_value: number | null
          model: string | null
          name: string
          notes: string | null
          purchase_date: string | null
          serial_number: string | null
          updated_at: string
          user_id: string
          warranty: string | null
          year: number | null
        }
        Insert: {
          active?: boolean
          bike_hours_at_install?: number | null
          bike_id: string
          bike_km_at_install?: number | null
          brand?: string | null
          category?: string | null
          created_at?: string
          id?: string
          install_date?: string | null
          interval_type?: string | null
          interval_value?: number | null
          model?: string | null
          name: string
          notes?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          updated_at?: string
          user_id: string
          warranty?: string | null
          year?: number | null
        }
        Update: {
          active?: boolean
          bike_hours_at_install?: number | null
          bike_id?: string
          bike_km_at_install?: number | null
          brand?: string | null
          category?: string | null
          created_at?: string
          id?: string
          install_date?: string | null
          interval_type?: string | null
          interval_value?: number | null
          model?: string | null
          name?: string
          notes?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          updated_at?: string
          user_id?: string
          warranty?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "components_bike_id_fkey"
            columns: ["bike_id"]
            isOneToOne: false
            referencedRelation: "bikes"
            referencedColumns: ["id"]
          },
        ]
      }
      interventions: {
        Row: {
          bike_hours_at_intervention: number | null
          bike_km_at_intervention: number | null
          component_id: string
          created_at: string
          date: string
          description: string | null
          hours_used: number | null
          id: string
          kms: number | null
          notes: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bike_hours_at_intervention?: number | null
          bike_km_at_intervention?: number | null
          component_id: string
          created_at?: string
          date: string
          description?: string | null
          hours_used?: number | null
          id?: string
          kms?: number | null
          notes?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bike_hours_at_intervention?: number | null
          bike_km_at_intervention?: number | null
          component_id?: string
          created_at?: string
          date?: string
          description?: string | null
          hours_used?: number | null
          id?: string
          kms?: number | null
          notes?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interventions_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interventions_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "components_status"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_log: {
        Row: {
          component_id: string | null
          episode_date: string | null
          id: string
          sent_at: string
          type: string
          user_id: string
        }
        Insert: {
          component_id?: string | null
          episode_date?: string | null
          id?: string
          sent_at?: string
          type: string
          user_id: string
        }
        Update: {
          component_id?: string | null
          episode_date?: string | null
          id?: string
          sent_at?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_log_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "components_status"
            referencedColumns: ["id"]
          },
        ]
      }
      strava_activities: {
        Row: {
          bike_id: string
          distance_km: number
          moving_time_hours: number
          processed_at: string
          strava_activity_id: number
        }
        Insert: {
          bike_id: string
          distance_km: number
          moving_time_hours: number
          processed_at?: string
          strava_activity_id: number
        }
        Update: {
          bike_id?: string
          distance_km?: number
          moving_time_hours?: number
          processed_at?: string
          strava_activity_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "strava_activities_bike_id_fkey"
            columns: ["bike_id"]
            isOneToOne: false
            referencedRelation: "bikes"
            referencedColumns: ["id"]
          },
        ]
      }
      strava_connections: {
        Row: {
          access_token: string
          athlete_id: number
          created_at: string
          expires_at: string
          refresh_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          athlete_id: number
          created_at?: string
          expires_at: string
          refresh_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          athlete_id?: number
          created_at?: string
          expires_at?: string
          refresh_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      components_status: {
        Row: {
          active: boolean | null
          bike_hours_at_install: number | null
          bike_id: string | null
          bike_km_at_install: number | null
          brand: string | null
          category: string | null
          created_at: string | null
          id: string | null
          install_date: string | null
          interval_type: string | null
          interval_value: number | null
          last_intervention_date: string | null
          last_service_hours: number | null
          last_service_km: number | null
          model: string | null
          name: string | null
          notes: string | null
          serial_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "components_bike_id_fkey"
            columns: ["bike_id"]
            isOneToOne: false
            referencedRelation: "bikes"
            referencedColumns: ["id"]
          },
        ]
      }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
