import { stripe } from "@/server/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  // @ts-ignore
  context: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await context.params;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const url = session.url;

    if (url) {
      return NextResponse.redirect(url);
    } else {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error retrieving Stripe session:", error);
    return NextResponse.json(
      { error: "Error retrieving Stripe session" },
      { status: 500 },
    );
  }
}
