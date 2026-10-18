import Link from "next/link";
import LegalShell from "../legal-shell";

export const metadata = { title: "SMS terms · Donate the Difference" };

export default function Sms() {
  return (
    <LegalShell title="SMS terms & opt-in" updated="October 18, 2026">
      <p>
        Donate the Difference is operated by Yardboat LLC. It lets you log purchases you chose not to make by texting our number, and replies with a receipt showing progress toward your personal savings goal and the amount pledged to a matched charity.
      </p>

      <h2>How you opt in</h2>
      <p>
        You opt in on our website at <Link href="/#start">notbuying.org</Link> by entering your mobile number, ticking an unticked consent checkbox, and submitting the form. The checkbox reads:
      </p>
      <blockquote className="border-l-4 border-ink pl-4 italic">
        &ldquo;Text me receipts and a weekly recap from Donate the Difference. Message frequency varies with how often you text us. Msg &amp; data rates may apply. Reply STOP to opt out, HELP for help.&rdquo;
      </blockquote>
      <p>We only text numbers that completed this form. We never buy, rent or share phone numbers.</p>

      <h2>What we send</h2>
      <ul>
        <li>A reply to each message you send us (your receipt).</li>
        <li>A sign-in code when you log in to the website.</li>
        <li>One weekly recap on Sundays.</li>
      </ul>
      <p>Message frequency varies with how often you text us; typically a few messages a week. Message and data rates may apply.</p>

      <h2>Sample messages</h2>
      <ul>
        <li>&ldquo;No croissant. +$5. Bike: $155 of $500 (31%). $0.50 pledged to Feeding America (~5 meals). Every no is a yes to something.&rdquo;</li>
        <li>&ldquo;Issue 03 is out. This week you said no 7 times: $86 not spent, $8.60 pledged. See it + send the donations: https://notbuying.org/issue/2026-10-12&rdquo;</li>
        <li>&ldquo;Donate the Difference code: 482913. Reply STOP to opt out.&rdquo;</li>
      </ul>

      <h2>Opting out and help</h2>
      <p>
        Reply <strong>STOP</strong> at any time to stop all messages. Reply <strong>START</strong> to resume. Reply <strong>HELP</strong> for help, or email hello@notbuying.org. Carriers are not liable for delayed or undelivered messages.
      </p>

      <p>
        See also our <Link href="/legal/privacy">Privacy Policy</Link> and <Link href="/legal/terms">Terms</Link>.
      </p>
    </LegalShell>
  );
}
