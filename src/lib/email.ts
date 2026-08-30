import { Resend } from "resend";

let client: Resend | null = null;

function getClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set.");
  }
  if (!client) client = new Resend(apiKey);
  return client;
}

export async function sendContactNotification(input: {
  to: string;
  name: string;
  email: string;
  message: string;
  newsletter: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const from = process.env.CONTACT_EMAIL_FROM;
  if (!from) {
    return { ok: false, error: "CONTACT_EMAIL_FROM is not set." };
  }

  try {
    const resend = getClient();
    const { error } = await resend.emails.send({
      from,
      to: input.to,
      replyTo: input.email,
      subject: `New message from ${input.name} via the ConScept site`,
      text: `Name: ${input.name}\nEmail: ${input.email}\nNewsletter: ${
        input.newsletter ? "yes" : "no"
      }\n\n${input.message}`,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
