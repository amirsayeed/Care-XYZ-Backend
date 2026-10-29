import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { getDB } from "../config/database";
import { successResponse, errorResponse } from "../utils/response";
import { sendInvoiceEmail } from "../utils/email";
import { bookingSchema, BookingInput } from "../utils/validators";
import { ObjectId } from "mongodb";

export async function createBooking(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return errorResponse(res, "Unauthorized", 401);
    }

    const validation = bookingSchema.safeParse(req.body);
    if (!validation.success) {
      return errorResponse(res, validation.error.issues[0].message, 400);
    }

    const bookingData = validation.data as BookingInput;

    const db = await getDB();
    const servicesCollection = db.collection("services");
    const bookingsCollection = db.collection("bookings");

    // Get service to calculate cost
    const service = await servicesCollection.findOne({
      _id: new ObjectId(bookingData.serviceId),
    });

    if (!service) {
      return errorResponse(res, "Service not found", 404);
    }

    const totalCost = bookingData.duration * service.hourlyRate;

    // Create booking
    const result = await bookingsCollection.insertOne({
      userId: new ObjectId(req.userId),
      serviceId: new ObjectId(bookingData.serviceId),
      duration: bookingData.duration,
      division: bookingData.division,
      district: bookingData.district,
      city: bookingData.city,
      area: bookingData.area,
      address: bookingData.address,
      totalCost,
      status: "pending",
      invoiceSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const bookingId = result.insertedId.toString();

    // Send invoice email
    const emailSent = await sendInvoiceEmail(req.email!, {
      bookingId,
      serviceName: service.title,
      duration: bookingData.duration,
      totalCost,
      location: `${bookingData.area}, ${bookingData.city}, ${bookingData.district}, ${bookingData.division}`,
      status: "pending",
    });

    // Update invoiceSent status
    if (emailSent) {
      await bookingsCollection.updateOne(
        { _id: new ObjectId(bookingId) },
        { $set: { invoiceSent: true } }
      );
    }

    return successResponse(
      res,
      {
        bookingId,
        serviceName: service.title,
        duration: bookingData.duration,
        totalCost,
        status: "pending",
      },
      "Booking created successfully",
      201
    );
  } catch (error) {
    return errorResponse(res, "Failed to create booking", 500, error);
  }
}

export async function getUserBookings(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return errorResponse(res, "Unauthorized", 401);
    }

    const db = await getDB();
    const bookingsCollection = db.collection("bookings");
    const servicesCollection = db.collection("services");

    const bookings = await bookingsCollection
      .find({ userId: new ObjectId(req.userId) })
      .sort({ createdAt: -1 })
      .toArray();

    // Enrich with service names
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const service = await servicesCollection.findOne({
          _id: booking.serviceId,
        });
        return {
          ...booking,
          serviceName: service?.title || "Unknown",
        };
      })
    );

    return successResponse(res, enrichedBookings, "Bookings fetched");
  } catch (error) {
    return errorResponse(res, "Failed to fetch bookings", 500, error);
  }
}

export async function getBookingById(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return errorResponse(res, "Unauthorized", 401);
    }

    const { id } = req.params as { id: string };

    if (!ObjectId.isValid(id)) {
      return errorResponse(res, "Invalid booking ID", 400);
    }

    const db = await getDB();
    const bookingsCollection = db.collection("bookings");
    const servicesCollection = db.collection("services");

    const booking = await bookingsCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(req.userId),
    });

    if (!booking) {
      return errorResponse(res, "Booking not found", 404);
    }

    const service = await servicesCollection.findOne({
      _id: booking.serviceId,
    });

    return successResponse(res, {
      ...booking,
      serviceName: service?.title || "Unknown",
    });
  } catch (error) {
    return errorResponse(res, "Failed to fetch booking", 500, error);
  }
}

export async function cancelBooking(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return errorResponse(res, "Unauthorized", 401);
    }

    const { id } = req.params as { id: string };

    if (!ObjectId.isValid(id)) {
      return errorResponse(res, "Invalid booking ID", 400);
    }

    const db = await getDB();
    const bookingsCollection = db.collection("bookings");

    const booking = await bookingsCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(req.userId),
    });

    if (!booking) {
      return errorResponse(res, "Booking not found", 404);
    }

    if (booking.status === "cancelled") {
      return errorResponse(res, "Booking already cancelled", 400);
    }

    const result = await bookingsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "cancelled",
          updatedAt: new Date(),
        },
      }
    );

    return successResponse(res, { status: "cancelled" }, "Booking cancelled");
  } catch (error) {
    return errorResponse(res, "Failed to cancel booking", 500, error);
  }
}