import nodemailer from 'nodemailer';

async function testEmail() {
  console.log("Starting email test...");
  
  if (!process.env.SPACEMAIL_EMAIL || !process.env.SPACEMAIL_PASSWORD) {
    console.error("❌ Missing SPACEMAIL_EMAIL or SPACEMAIL_PASSWORD in .env");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: "mail.spacemail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SPACEMAIL_EMAIL,
      pass: process.env.SPACEMAIL_PASSWORD,
    },
  });

  try {
    console.log("Attempting to send email...");
    const info = await transporter.sendMail({
      from: `"SkyGear Test" <${process.env.SPACEMAIL_EMAIL}>`,
      to: "phils7872@gmail.com",
      subject: "Test Email from SkyGear App",
      text: "This is a test email to verify that Spacemail SMTP is working correctly.",
      html: "<b>This is a test email</b> to verify that Spacemail SMTP is working correctly.",
    });

    console.log("✅ Email sent successfully!");
    console.log("Message ID: %s", info.messageId);
  } catch (error) {
    console.error("❌ Failed to send email:");
    console.error(error);
  }
}

testEmail();
