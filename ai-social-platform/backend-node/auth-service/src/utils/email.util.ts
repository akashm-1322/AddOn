export async function sendSMS(phone: string, message: string) {
  // Integrate with a real SMS provider (Twilio, MessageBird) in production.
  console.log(`sendSMS -> ${phone}: ${message}`);
  return true;
}

export async function sendEmail(to: string, subject: string, html: string) {
  // Integrate with real email provider (SendGrid, SES) in production.
  console.log(`sendEmail -> ${to}: ${subject}\n${html}`);
  return true;
}
