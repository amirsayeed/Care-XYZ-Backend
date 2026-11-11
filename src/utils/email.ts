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

export interface InvoiceData {
  bookingId: string;
  serviceName: string;
  duration: number;
  totalCost: number;
  location: string;
  status: string;
}

const COLORS = {
  brand: "#0d9488",
  brandDark: "#134e4a",
  soft: "#f0fdfa",
  border: "#d5ebe8",
  text: "#0f172a",
  muted: "#64748b",
};

const STATUS_STYLES: Record<string, { background: string; color: string }> = {
  pending: { background: "#fef9c3", color: "#854d0e" },
  confirmed: { background: "#ccfbf1", color: "#115e59" },
  completed: { background: "#dcfce7", color: "#166534" },
  cancelled: { background: "#e5e7eb", color: "#374151" },
};

// Escapes values taken from the database before they go into HTML
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatTaka(amount: number): string {
  return `৳${amount.toLocaleString("en-US")}`;
}

function detailRow(label: string, valueHtml: string, isLast = false): string {
  const border = isLast ? "" : `border-bottom:1px solid ${COLORS.border};`;
  return `
          <tr>
            <td style="padding:14px 0;${border}color:${COLORS.muted};font-size:14px;width:38%;">${label}</td>
            <td style="padding:14px 0;${border}color:${COLORS.text};font-size:14px;font-weight:bold;text-align:right;">${valueHtml}</td>
          </tr>`;
}

// Email clients ignore flexbox, grid, and external stylesheets, so the layout uses
// nested tables and inline styles. This is the approach that renders reliably in Gmail and Outlook.
export function buildInvoiceHtml(data: InvoiceData): string {
  const appUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
  const status = STATUS_STYLES[data.status] ?? STATUS_STYLES.pending;
  const year = new Date().getFullYear();

  const statusPill = `<span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${status.background};color:${status.color};font-size:12px;font-weight:bold;text-transform:capitalize;">${escapeHtml(data.status)}</span>`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Care.xyz Booking Invoice</title>
  </head>
  <body style="margin:0;padding:0;background:${COLORS.soft};font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.soft};padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;">

            <tr>
              <td style="background:${COLORS.brand};padding:28px 32px;border-radius:16px 16px 0 0;">
                <p style="margin:0;color:#ffffff;font-size:22px;font-weight:bold;">Care.xyz</p>
                <p style="margin:6px 0 0;color:#ccfbf1;font-size:13px;">Booking invoice</p>
              </td>
            </tr>

            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 8px;color:${COLORS.text};font-size:18px;font-weight:bold;">Thank you for your booking</p>
                <p style="margin:0 0 24px;color:${COLORS.muted};font-size:14px;line-height:22px;">
                  Your care request has been received. Keep this invoice for your records.
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.soft};border-radius:10px;">
                  <tr>
                    <td style="padding:14px 18px;">
                      <p style="margin:0;color:${COLORS.muted};font-size:11px;text-transform:uppercase;letter-spacing:1px;">Booking ID</p>
                      <p style="margin:4px 0 0;color:${COLORS.brandDark};font-family:'Courier New',Courier,monospace;font-size:14px;font-weight:bold;">${escapeHtml(data.bookingId)}</p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                  ${detailRow("Service", escapeHtml(data.serviceName))}
                  ${detailRow("Duration", `${data.duration} day(s)`)}
                  ${detailRow("Location", escapeHtml(data.location))}
                  ${detailRow("Status", statusPill, true)}
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background:${COLORS.brandDark};border-radius:12px;">
                  <tr>
                    <td style="padding:20px 24px;color:#ccfbf1;font-size:14px;">Total amount</td>
                    <td align="right" style="padding:20px 24px;color:#ffffff;font-size:26px;font-weight:bold;">${formatTaka(data.totalCost)}</td>
                  </tr>
                </table>

                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
                  <tr>
                    <td align="center" style="border-radius:8px;background:${COLORS.brand};">
                      <a href="${appUrl}/my-bookings" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;border-radius:8px;">View my bookings</a>
                    </td>
                  </tr>
                </table>

                <p style="margin:28px 0 0;color:${COLORS.muted};font-size:13px;line-height:20px;">
                  Payment is made from My bookings on the Care.xyz website. Only pending bookings can be cancelled there.
                </p>
              </td>
            </tr>

            <tr>
              <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid ${COLORS.border};border-radius:0 0 16px 16px;">
                <p style="margin:0;color:${COLORS.muted};font-size:12px;line-height:18px;">
                  Questions about this booking? Reply to this email and include your booking ID.
                </p>
                <p style="margin:10px 0 0;color:#94a3b8;font-size:11px;">&copy; ${year} Care.xyz. All rights reserved.</p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// Plain-text fallback for email clients that block HTML
function buildInvoiceText(data: InvoiceData): string {
  return [
    "Care.xyz Booking Invoice",
    "",
    `Booking ID: ${data.bookingId}`,
    `Service: ${data.serviceName}`,
    `Duration: ${data.duration} day(s)`,
    `Location: ${data.location}`,
    `Status: ${data.status}`,
    `Total amount: ${formatTaka(data.totalCost)}`,
    "",
    "Thank you for booking with Care.xyz.",
  ].join("\n");
}

export async function sendInvoiceEmail(
  toEmail: string,
  bookingData: InvoiceData
): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
      to: toEmail,
      subject: `Care.xyz Booking Invoice - ${bookingData.bookingId}`,
      text: buildInvoiceText(bookingData),
      html: buildInvoiceHtml(bookingData),
    });
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
}