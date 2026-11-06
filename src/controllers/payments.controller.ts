import type { Request, Response } from "express";
import Stripe from "stripe";
import { ObjectId } from "mongodb";
import { getDB } from "../config/database";
import { AuthRequest } from "../middleware/auth";
import { successResponse, errorResponse } from "../utils/response";
import { stripe, bdtToUsdCents } from "../utils/stripe";

const frontendUrl = () => process.env.FRONTEND_URL ?? "http://localhost:3000";

// Creates a Stripe Checkout session for one of the user's unpaid bookings
export async function createCheckout(req: AuthRequest, res: Response) {
  try {
    const bookingId = req.params.bookingId as string;
    if (!ObjectId.isValid(bookingId)) {
      return errorResponse(res, "Invalid booking ID", 400);
    }

    const db = await getDB();
    const booking = await db.collection("bookings").findOne({
      _id: new ObjectId(bookingId),
      userId: new ObjectId(req.userId!),
    });

    if (!booking) return errorResponse(res, "Booking not found", 404);
    if (booking.status === "cancelled") {
      return errorResponse(res, "Booking is cancelled", 400);
    }
    if (booking.paymentStatus === "paid") {
      return errorResponse(res, "Booking is already paid", 400);
    }

    const service = await db
      .collection("services")
      .findOne({ _id: booking.serviceId });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: req.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: bdtToUsdCents(booking.totalCost),
            product_data: {
              name: `${service?.title ?? "Care service"} - ${booking.duration} day(s)`,
            },
          },
        },
      ],
      metadata: { bookingId, userId: req.userId! },
      success_url: `${frontendUrl()}/my-bookings?paid=${bookingId}`,
      cancel_url: `${frontendUrl()}/my-bookings?cancelled=${bookingId}`,
    });

    return successResponse(res, { url: session.url }, "Checkout session created");
  } catch (error) {
    return errorResponse(res, "Could not start payment", 500, error);
  }
}

// Stripe calls this endpoint. It must receive the raw body, see app.ts
export async function handleStripeWebhook(req: Request, res: Response) {
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      req.headers["stripe-signature"] as string,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("[stripe-webhook] signature check failed", error);
    return res.status(400).send("Invalid signature");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;
    const userId = session.metadata?.userId;

    if (session.payment_status === "paid" && bookingId && userId) {
      try {
        await recordPayment(session, bookingId, userId);
      } catch (error) {
        // Returning 500 makes Stripe retry the event later
        console.error("[stripe-webhook] could not record payment", error);
        return res.status(500).send("Processing failed");
      }
    }
  }

  return res.json({ received: true });
}

async function recordPayment(
  session: Stripe.Checkout.Session,
  bookingId: string,
  userId: string
) {
  const db = await getDB();
  const payments = db.collection("payments");

  // A unique index stops the same Stripe session from being recorded twice
  await payments.createIndex({ stripeSessionId: 1 }, { unique: true });

  try {
    await payments.insertOne({
      stripeSessionId: session.id,
      bookingId: new ObjectId(bookingId),
      userId: new ObjectId(userId),
      amount: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
      status: "paid",
      createdAt: new Date(),
    });
  } catch (error) {
    // Duplicate delivery: the payment is already stored. Still update the
    // booking below, in case the earlier attempt failed after this insert.
    if ((error as { code?: number }).code !== 11000) throw error;
  }

  await db.collection("bookings").updateOne(
    { _id: new ObjectId(bookingId) },
    {
      $set: {
        paymentStatus: "paid",
        status: "confirmed",
        updatedAt: new Date(),
      },
    }
  );
}

// Payment history for the signed-in user
export async function getMyPayments(req: AuthRequest, res: Response) {
  try {
    const db = await getDB();
    const payments = await db
      .collection("payments")
      .find({ userId: new ObjectId(req.userId!) })
      .sort({ createdAt: -1 })
      .toArray();

    return successResponse(res, payments, "Payments fetched");
  } catch (error) {
    return errorResponse(res, "Failed to fetch payments", 500, error);
  }
}