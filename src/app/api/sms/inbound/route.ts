import { NextRequest } from "next/server";
import { appUrl } from "@/lib/env";
import { handleMessage, userByPhone } from "@/lib/ledger";
import { normalizePhone, twiml, validTwilioSignature } from "@/lib/sms";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const params: Record<string, string> = {};
  form.forEach((v, k) => (params[k] = String(v)));

  // Twilio signs the exact public URL it called.
  const url = `${appUrl()}/api/sms/inbound`;
  if (!validTwilioSignature(url, params, req.headers.get("x-twilio-signature"))) {
    return new Response("forbidden", { status: 403 });
  }

  const phone = normalizePhone(params.From ?? "");
  const body = (params.Body ?? "").trim();
  const xml = (m: string | null) => new Response(twiml(m), { headers: { "Content-Type": "text/xml" } });
  if (!phone || !body) return xml(null);

  const user = await userByPhone(phone);
  if (!user) {
    return xml(`Not Buying: you're not signed up yet. Start here: ${appUrl()}/ Reply STOP to opt out.`);
  }
  if (user.status === "stopped" && !/^(start|unstop|yes)$/i.test(body)) return xml(null);

  const reply = await handleMessage({ user, body, channel: "sms", sid: params.MessageSid ?? null });
  return xml(reply);
}
