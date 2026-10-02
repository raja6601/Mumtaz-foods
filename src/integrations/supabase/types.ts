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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_discount: number | null
          min_order: number
          times_used: number
          usage_limit: number | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_order?: number
          times_used?: number
          usage_limit?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_order?: number
          times_used?: number
          usage_limit?: number | null
        }
        Relationships: []
      }
      deals: {
        Row: {
          created_at: string
          deal_price: number | null
          description: string | null
          id: string
          image_url: string | null
          includes: string | null
          is_active: boolean
          name: string
          original_price: number | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deal_price?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          includes?: string | null
          is_active?: boolean
          name: string
          original_price?: number | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deal_price?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          includes?: string | null
          is_active?: boolean
          name?: string
          original_price?: number | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      delivery_zones: {
        Row: {
          delivery_fee: number
          eta_minutes: number | null
          id: string
          is_active: boolean
          min_order: number
          name: string
          sort_order: number
        }
        Insert: {
          delivery_fee?: number
          eta_minutes?: number | null
          id?: string
          is_active?: boolean
          min_order?: number
          name: string
          sort_order?: number
        }
        Update: {
          delivery_fee?: number
          eta_minutes?: number | null
          id?: string
          is_active?: boolean
          min_order?: number
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      gallery: {
        Row: {
          caption: string | null
          category: string
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          sort_order: number
        }
        Insert: {
          caption?: string | null
          category?: string
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          sort_order?: number
        }
        Update: {
          caption?: string | null
          category?: string
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      opening_hours: {
        Row: {
          closes_at: string | null
          day_of_week: number
          id: string
          is_closed: boolean
          opens_at: string | null
          updated_at: string
        }
        Insert: {
          closes_at?: string | null
          day_of_week: number
          id?: string
          is_closed?: boolean
          opens_at?: string | null
          updated_at?: string
        }
        Update: {
          closes_at?: string | null
          day_of_week?: number
          id?: string
          is_closed?: boolean
          opens_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          deal_id: string | null
          id: string
          item_name: string
          options: Json
          order_id: string
          product_id: string | null
          quantity: number
          special_instructions: string | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          deal_id?: string | null
          id?: string
          item_name: string
          options?: Json
          order_id: string
          product_id?: string | null
          quantity?: number
          special_instructions?: string | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          deal_id?: string | null
          id?: string
          item_name?: string
          options?: Json
          order_id?: string
          product_id?: string | null
          quantity?: number
          special_instructions?: string | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string | null
          area: string | null
          coupon_code: string | null
          created_at: string
          customer_name: string
          delivery_fee: number
          discount: number
          email: string | null
          id: string
          landmark: string | null
          notes: string | null
          order_number: string
          order_type: string
          payment_method: string
          phone: string
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          area?: string | null
          coupon_code?: string | null
          created_at?: string
          customer_name: string
          delivery_fee?: number
          discount?: number
          email?: string | null
          id?: string
          landmark?: string | null
          notes?: string | null
          order_number?: string
          order_type?: string
          payment_method?: string
          phone: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          area?: string | null
          coupon_code?: string | null
          created_at?: string
          customer_name?: string
          delivery_fee?: number
          discount?: number
          email?: string | null
          id?: string
          landmark?: string | null
          notes?: string | null
          order_number?: string
          order_type?: string
          payment_method?: string
          phone?: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      product_options: {
        Row: {
          created_at: string
          extra_price: number
          group_name: string
          id: string
          is_required: boolean
          name: string
          product_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          extra_price?: number
          group_name?: string
          id?: string
          is_required?: boolean
          name: string
          product_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          extra_price?: number
          group_name?: string
          id?: string
          is_required?: boolean
          name?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean
          is_featured: boolean
          is_placeholder: boolean
          is_vegetarian: boolean
          keywords: string | null
          name: string
          price: number | null
          serving_size: string | null
          slug: string
          sort_order: number
          spice_level: string | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_featured?: boolean
          is_placeholder?: boolean
          is_vegetarian?: boolean
          keywords?: string | null
          name: string
          price?: number | null
          serving_size?: string | null
          slug: string
          sort_order?: number
          spice_level?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_featured?: boolean
          is_placeholder?: boolean
          is_vegetarian?: boolean
          keywords?: string | null
          name?: string
          price?: number | null
          serving_size?: string | null
          slug?: string
          sort_order?: number
          spice_level?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_settings: {
        Row: {
          about_text: string | null
          accepts_online_payment: boolean
          address: string | null
          brand_name: string
          delivery_fee: number
          email: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          maps_url: string | null
          min_order: number
          phone: string | null
          prep_time_minutes: number
          tagline: string | null
          tax_percent: number
          tiktok_url: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          about_text?: string | null
          accepts_online_payment?: boolean
          address?: string | null
          brand_name?: string
          delivery_fee?: number
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          maps_url?: string | null
          min_order?: number
          phone?: string | null
          prep_time_minutes?: number
          tagline?: string | null
          tax_percent?: number
          tiktok_url?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          about_text?: string | null
          accepts_online_payment?: boolean
          address?: string | null
          brand_name?: string
          delivery_fee?: number
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          maps_url?: string | null
          min_order?: number
          phone?: string | null
          prep_time_minutes?: number
          tagline?: string | null
          tax_percent?: number
          tiktok_url?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "staff"],
    },
  },
} as const
