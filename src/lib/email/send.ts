import type { ReactElement } from "react";
import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

interface SendEmailOptions {
  to: string;
  subject: string;
  react: ReactElement;
}

export async function sendEmail({
  to,
  subject,
  react,
}: SendEmailOptions): Promise<void> {
  const resend = getResend();
  const { error } = await resend.emails.send({
    from: "Moto Assistant <noreply@motomarket.gr>",
    to,
    subject,
    react,
  });

  if (error) {
    console.error("Email send error:", error);
    throw error;
  }
}
