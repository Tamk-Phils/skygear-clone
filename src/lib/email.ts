import nodemailer from "nodemailer";

const getTransporter = () => {
  if (!process.env.SPACEMAIL_EMAIL || !process.env.SPACEMAIL_PASSWORD) {
    throw new Error("Missing Spacemail credentials in environment variables");
  }
  return nodemailer.createTransport({
    host: "mail.spacemail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SPACEMAIL_EMAIL,
      pass: process.env.SPACEMAIL_PASSWORD,
    },
  });
};

export const sendContactEmail = async ({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"SkyGear Contact Form" <${process.env.SPACEMAIL_EMAIL}>`,
    to: process.env.SPACEMAIL_EMAIL, // Send to the admin
    replyTo: email, // Allow admin to reply directly to the user
    subject: `New Contact Request: ${subject}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: `
      <h2>New Contact Request</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <hr />
      <p style="white-space: pre-wrap;">${message}</p>
    `,
  });
};

export const sendCheckoutEmail = async ({
  orderId,
  customerEmail,
  customerName,
  total,
}: {
  orderId: string;
  customerEmail: string;
  customerName: string;
  total: number;
}) => {
  const transporter = getTransporter();

  // Send email to admin
  await transporter.sendMail({
    from: `"SkyGear Orders" <${process.env.SPACEMAIL_EMAIL}>`,
    to: process.env.SPACEMAIL_EMAIL,
    subject: `New Order Received: #${orderId}`,
    text: `A new order has been placed.\n\nOrder ID: ${orderId}\nCustomer: ${customerName} (${customerEmail})\nTotal: $${total.toFixed(2)}`,
    html: `
      <h2>New Order Received</h2>
      <p><strong>Order ID:</strong> #${orderId}</p>
      <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
      <p><strong>Total:</strong> $${total.toFixed(2)}</p>
    `,
  });
};
