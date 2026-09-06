export interface CreateNewsletterSubscriptionPayload {
  email: string;
}

export interface NewsletterSubscription {
  id: number;
  email: string;
  user_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface NewsletterStatus {
  subscribed: boolean;
  email: string | null;
  user_id: number | null;
}