import { SubscriptionPlan } from './database';

// PayPal API типы
export interface PayPalOrderRequest {
  planType: SubscriptionPlan;
}

export interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface PayPalCaptureRequest {
  orderID: string;
}

export interface PayPalCaptureResponse {
  id: string;
  status: string;
  purchase_units: Array<{
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
      }>;
    };
  }>;
}

export interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource_type: string;
  resource: {
    id: string;
    [key: string]: any;
  };
  create_time: string;
}

// Pricing планы
export interface PricingPlan {
  id: SubscriptionPlan;
  name: string;
  price: number;
  currency: string;
  features: string[];
  popular?: boolean;
  paypalPlanId?: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    features: [
      '5 exports per day',
      'Basic table formats',
      'Standard support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 5.00,
    currency: 'USD',
    popular: true,
    features: [
      'Unlimited exports',
      'All table formats',
      'Google Drive integration',
      'Priority support',
      'Custom templates'
    ]
  }
];