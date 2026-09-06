import { del, get, post } from "@/lib/api/client";
import type { ApiEnvelope } from "@/types/api";
import type {
  NewsletterStatus,
  NewsletterSubscription,
} from "@/types/newsletter";

export async function subscribeToNewsletter(
  email: string
): Promise<ApiEnvelope<NewsletterSubscription>> {
  return post<NewsletterSubscription>("/newsletter-subscribers/subscribe/", {
    email,
  });
}

export async function getNewsletterStatus(): Promise<NewsletterStatus> {
  const response = await get<NewsletterStatus>(
    "/newsletter-subscribers/status/",
    { auth: true }
  );
  return response.data;
}

export async function unsubscribeFromNewsletter(): Promise<string> {
  const response = await del("/newsletter-subscribers/unsubscribe/", {
    auth: true,
  });
  return response.message;
}