// Enum типы на основе схемы (обновленные)
export type SubscriptionPlan = 'free' | 'pro'; // убрал enterprise
export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'past_due';
export type PaymentProvider = 'paypal' | 'stripe';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type ExportDestination = 'download' | 'google_drive' | 'email';

// Основные интерфейсы таблиц
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  google_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: SubscriptionPlan;
  status: SubscriptionStatus;
  paypal_subscription_id: string | null;
  paypal_plan_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  subscription_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  paypal_order_id: string | null;
  paypal_payment_id: string | null;
  provider_data: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface PaypalWebhook {
  id: string;
  event_id: string;
  event_type: string;
  resource_type: string;
  resource_id: string;
  processed: boolean;
  data: Record<string, any>;
  created_at: string;
}

export interface ExportHistory {
  id: string;
  user_id: string;
  table_data: Record<string, any>;
  export_format: string;
  destination: ExportDestination;
  file_size: number | null;
  created_at: string;
}

export interface UsageQuota {
  id: string;
  user_id: string;
  exports_used: number;
  exports_limit: number;
  exports_today: number;
  last_reset_date: string;
  created_at: string;
  updated_at: string;
}

export interface SavedTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  template_data: Record<string, any>;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface SharedTable {
  id: string;
  user_id: string;
  table_data: Record<string, any>;
  share_token: string;
  expires_at: string | null;
  view_count: number;
  created_at: string;
}

// Database типы для Supabase
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Subscription, 'id' | 'created_at' | 'updated_at'>>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Payment, 'id' | 'created_at' | 'updated_at'>>;
      };
      paypal_webhooks: {
        Row: PaypalWebhook;
        Insert: Omit<PaypalWebhook, 'id' | 'created_at'>;
        Update: Partial<Omit<PaypalWebhook, 'id' | 'created_at'>>;
      };
      export_history: {
        Row: ExportHistory;
        Insert: Omit<ExportHistory, 'id' | 'created_at'>;
        Update: Partial<Omit<ExportHistory, 'id' | 'created_at'>>;
      };
      usage_quotas: {
        Row: UsageQuota;
        Insert: Omit<UsageQuota, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UsageQuota, 'id' | 'created_at' | 'updated_at'>>;
      };
      saved_templates: {
        Row: SavedTemplate;
        Insert: Omit<SavedTemplate, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SavedTemplate, 'id' | 'created_at' | 'updated_at'>>;
      };
      shared_tables: {
        Row: SharedTable;
        Insert: Omit<SharedTable, 'id' | 'created_at'>;
        Update: Partial<Omit<SharedTable, 'id' | 'created_at'>>;
      };
    };
    Functions: {
      increment_daily_exports: {
        Args: { user_uuid: string };
        Returns: void;
      };
      check_daily_export_limit: {
        Args: { user_uuid: string };
        Returns: {
          can_export: boolean;
          exports_today: number;
          daily_limit: number;
          plan_type: string;
        }[];
      };
      get_usage_stats: {
        Args: { user_uuid: string };
        Returns: {
          exports_today: number;
          daily_limit: number;
          exports_remaining: number;
          plan_type: string;
          can_export: boolean;
          reset_time: string;
        }[];
      };
    };
  };
}

// Utility типы для API
export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  success: boolean;
};

export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  total: number;
  page: number;
  limit: number;
}>;