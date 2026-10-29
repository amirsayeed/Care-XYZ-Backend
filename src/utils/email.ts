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

// Test SMTP connection
transporter.verify((error, success) => {
  if (error) {
    console.log("✗ SMTP Connection Error:", error);
  } else {
    console.log("✓ SMTP Connected Successfully");
  }
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
    const htmlContent = `
      <h2>Care.xyz Booking Invoice</h2>
      <p>Dear Customer,</p>
      <p>Your booking has been confirmed. Here are the details:</p>
      <hr>
      <p><strong>Booking ID:</strong> ${bookingData.bookingId}</p>
      <p><strong>Service:</strong> ${bookingData.serviceName}</p>
      <p><strong>Duration:</strong> ${bookingData.duration} day(s)</p>
      <p><strong>Location:</strong> ${bookingData.location}</p>
      <p><strong>Total Cost:</strong> ₹${bookingData.totalCost}</p>
      <p><strong>Status:</strong> ${bookingData.status}</p>
      <hr>
      <p>Thank you for using Care.xyz!</p>
    `;

    await transporter.sendMail({
      from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
      to: toEmail,
      subject: `Care.xyz Booking Invoice - ${bookingData.bookingId}`,
      html: htmlContent,
    });

    console.log(`✓ Invoice sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error("✗ Email sending failed:", error);
    return false;
  }
}