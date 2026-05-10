import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export function getEmailFromAddress() {
  return process.env.RESEND_FROM_EMAIL ?? "DownFor <notifications@downfor.dev>";
}

export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  const resend = getResendClient();
  const from = getEmailFromAddress();

  if (!resend || !from) {
    return { skipped: true as const };
  }

  const result = await resend.emails.send({
    from,
    to,
    subject,
    text,
  });

  return { skipped: false as const, result };
}
