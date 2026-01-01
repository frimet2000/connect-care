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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          confirmed_at: string | null
          coordination_notes: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          parent_id: string
          patient_age_range: Database["public"]["Enums"]["age_range"]
          patient_first_name: string
          status: Database["public"]["Enums"]["appointment_status"] | null
          therapist_id: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          confirmed_at?: string | null
          coordination_notes?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          parent_id: string
          patient_age_range: Database["public"]["Enums"]["age_range"]
          patient_first_name: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          therapist_id: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          confirmed_at?: string | null
          coordination_notes?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          parent_id?: string
          patient_age_range?: Database["public"]["Enums"]["age_range"]
          patient_first_name?: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          therapist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          start_time: string
          therapist_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          start_time: string
          therapist_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          start_time?: string
          therapist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
          user_type: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          appointment_id: string | null
          created_at: string
          id: string
          is_verified: boolean | null
          parent_id: string
          rating: number
          review_text: string | null
          therapist_id: string
          would_recommend: boolean | null
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          parent_id: string
          rating: number
          review_text?: string | null
          therapist_id: string
          would_recommend?: boolean | null
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          parent_id?: string
          rating?: number
          review_text?: string | null
          therapist_id?: string
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapists: {
        Row: {
          accepts_btl: boolean | null
          address: string | null
          available_today: boolean | null
          avatar_url: string | null
          bio: string | null
          city: string
          created_at: string
          health_funds: string[] | null
          home_visits: boolean | null
          home_visits_radius_km: number | null
          id: string
          instant_booking: boolean | null
          is_active: boolean | null
          is_verified: boolean | null
          latitude: number | null
          license_number: string | null
          longitude: number | null
          profession: Database["public"]["Enums"]["profession_type"]
          rating_average: number | null
          rating_count: number | null
          session_duration_minutes: number | null
          specializations: string[] | null
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          accepts_btl?: boolean | null
          address?: string | null
          available_today?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          city: string
          created_at?: string
          health_funds?: string[] | null
          home_visits?: boolean | null
          home_visits_radius_km?: number | null
          id?: string
          instant_booking?: boolean | null
          is_active?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          license_number?: string | null
          longitude?: number | null
          profession: Database["public"]["Enums"]["profession_type"]
          rating_average?: number | null
          rating_count?: number | null
          session_duration_minutes?: number | null
          specializations?: string[] | null
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          accepts_btl?: boolean | null
          address?: string | null
          available_today?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          city?: string
          created_at?: string
          health_funds?: string[] | null
          home_visits?: boolean | null
          home_visits_radius_km?: number | null
          id?: string
          instant_booking?: boolean | null
          is_active?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          license_number?: string | null
          longitude?: number | null
          profession?: Database["public"]["Enums"]["profession_type"]
          rating_average?: number | null
          rating_count?: number | null
          session_duration_minutes?: number | null
          specializations?: string[] | null
          updated_at?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      age_range:
        | "infant"
        | "toddler"
        | "child_young"
        | "child_old"
        | "teen"
        | "adult"
      appointment_status: "pending" | "confirmed" | "completed" | "cancelled"
      profession_type:
        | "speech_therapy"
        | "physiotherapy"
        | "occupational_therapy"
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
    Enums: {
      age_range: [
        "infant",
        "toddler",
        "child_young",
        "child_old",
        "teen",
        "adult",
      ],
      appointment_status: ["pending", "confirmed", "completed", "cancelled"],
      profession_type: [
        "speech_therapy",
        "physiotherapy",
        "occupational_therapy",
      ],
    },
  },
} as const
