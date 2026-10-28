import Link from "next/link";
import LegalShell from "../legal-shell";
import { SMS_CONSENT_TEXT, SMS_OPTIN_CONFIRMATION } from "@/lib/consent";

export const metadata = { title: "SMS Terms & Opt-in · Not Buying" };

export default function Sms() {
  return (
    <LegalShell title="SMS Terms & Opt-in" updated="October 24, 2026">
      <p>
        <strong>Not Buying</strong> (notbuying.org) is operated by <strong>Yardboat LLC</strong>, Atlanta, Georgia, USA. People log purchases they chose not to make;
        Not Buying records them toward the person&apos;s savings goal and a pledge to a charity they picked. Texting is an <strong>optional</strong> way to log items
        and get a weekly recap. Everything also works on the website without texts.
      </p>

      <h2>How people opt in</h2>
      <p>
        On the sign-up form at <Link href="/#start">notbuying.org</Link>, below the mobile number field, there is a separate, <strong>unticked</strong>, optional
        checkbox labeled &ldquo;Text messages (optional).&rdquo; Next to the checkbox the person sees exactly this:
      </p>
      <blockquote className="border-l-4 border-ink pl-4">&ldquo;{SMS_CONSENT_TEXT}&rdquo;</blockquote>
      <ul>
        <li>The box is never pre-ticked, and people can create an account and use Not Buying without ticking it.</li>
        <li>Agreeing to our Terms and Privacy Policy is a separate line by the button and does not sign anyone up for texts.</li>
        <li>After someone ticks the box, we text a one-time code to confirm the number. Recurring texts start only after they enter it.</li>
        <li>People can also turn texts on or off later from their dashboard, with the same wording.</li>
      </ul>
      <figure className="mt-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/sms/opt-in.png" alt="Screenshot of the Not Buying sign-up form, showing the unticked optional text message checkbox and its consent wording" className="w-full border-2 border-ink" />
        <figcaption className="type mt-2 text-xs text-ink-2">The sign-up form as people see it at notbuying.org.</figcaption>
      </figure>

      <h2>What we send</h2>
      <ul>
        <li>A reply to each message the person sends us (a receipt for the item they logged).</li>
        <li>A one-time code to confirm their number when they turn texts on, then one confirmation message: &ldquo;{SMS_OPTIN_CONFIRMATION}&rdquo;</li>
        <li>One weekly recap on Sundays.</li>
      </ul>
      <p>Message frequency varies (about 2-10 messages per week). Message and data rates may apply. We never send marketing or promotional texts.</p>

      <h2>Sample messages</h2>
      <ul>
        <li>&ldquo;Not Buying: No takeout. +$25: $15 Bike, $7.50 savings, $2.50 to Feeding America (~25 meals). Bike: $155 of $500 (31%). Every no is a yes to something.&rdquo;</li>
        <li>&ldquo;Not Buying, Issue 03. $86 not spent, $8.60 to give. Send the difference + see your dashboard: https://notbuying.org/in/abc123&rdquo;</li>
        <li>&ldquo;Not Buying: your code is 482913. Enter it to turn on texts. Msg &amp; data rates may apply. Reply STOP to opt out.&rdquo;</li>
      </ul>

      <h2>Opting out and help</h2>
      <p>
        Reply <strong>STOP</strong> at any time to stop all messages; you&apos;ll get one confirmation and nothing after. Reply <strong>START</strong> to resume. Reply{" "}
        <strong>HELP</strong> for help, or email <a href="mailto:hello@notbuying.org">hello@notbuying.org</a>. Carriers are not liable for delayed or undelivered
        messages.
      </p>

      <h2>Privacy</h2>
      <p>
        No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. Text messaging originator opt-in data and consent
        will not be shared with any third parties. See our <Link href="/privacy">Privacy Policy</Link> and <Link href="/terms">Terms</Link>.
      </p>
    </LegalShell>
  );
}
