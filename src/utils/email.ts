import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendInvoiceEmail(
  toEmail: string,
  bookingData: {
    bookingId: string;
    serviceName: string;
    duration: number;
    totalCost: number;
    location: string;
    status: string;
  }
): Promise<boolean> {
  try {
    console.log(`📧 Invoice would be sent to ${toEmail}`);
    console.log("Booking Details:", bookingData);
    return true;
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
}