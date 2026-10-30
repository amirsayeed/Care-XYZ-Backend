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
    await transporter.sendMail({
      from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
      to: toEmail,
      subject: `Care.xyz Booking Invoice - ${bookingData.bookingId}`,
      html: `
        <h2>Care.xyz Booking Invoice</h2>
        <p><strong>Booking ID:</strong> ${bookingData.bookingId}</p>
        <p><strong>Service:</strong> ${bookingData.serviceName}</p>
        <p><strong>Duration:</strong> ${bookingData.duration} day(s)</p>
        <p><strong>Location:</strong> ${bookingData.location}</p>
        <p><strong>Total Cost:</strong> ₹${bookingData.totalCost}</p>
        <p><strong>Status:</strong> ${bookingData.status}</p>
        <hr>
        <p>Thank you for using Care.xyz!</p>
      `,
    });
    return true;
  } catch (error) {
    console.error("✗ Email sending failed:", error);
    return false;
  }
}