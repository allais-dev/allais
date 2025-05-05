import { handleSubscriptionWebhook } from "@/app/actions/stripe-actions"

export async function POST(req: Request) {
  return handleSubscriptionWebhook(req)
}
