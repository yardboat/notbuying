import Link from "next/link";
import LegalShell from "../../legal-shell";

export const metadata = { title: "Privacy Policy · Not Buying" };

export default function Privacy() {
  return (
    <LegalShell title="Privacy Policy" updated="October 24, 2026">
      <p>
        Not Buying (&ldquo;Not Buying,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) is a service operated by <strong>Yardboat LLC</strong>, Atlanta, Georgia, USA, at{" "}
        <Link href="/">notbuying.org</Link>. This policy explains what personal information we collect, how we use and protect it, and the choices you have.
        Contact: <a href="mailto:hello@notbuying.org">hello@notbuying.org</a>.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li><strong>Account information:</strong> your mobile phone number, an optional first name, a PIN you choose (stored only as a one-way hash), and your savings goal.</li>
        <li><strong>What you log:</strong> the items you tell us you chose not to buy, their prices, and the charities you pick.</li>
        <li><strong>Text messaging information:</strong> if you opt in to texts, the date and time of your opt-in, the consent wording you agreed to, and the messages you send to and receive from our number.</li>
        <li><strong>Donation records:</strong> when you start a donation through Every.org from our site, we record the charity, the amount and whether you confirmed it. We never see or store payment card details.</li>
        <li><strong>Usage data:</strong> basic, aggregated analytics about page visits (no advertising trackers).</li>
      </ul>

      <h2>How we use information</h2>
      <ul>
        <li>To provide the service: record what you log, calculate your goal progress and pledges, show your dashboard and weekly recap.</li>
        <li>If you opted in to texts: to reply to your texts, send a one-time code to confirm your number, and send one weekly recap.</li>
        <li>To keep the service secure, prevent abuse and fix problems.</li>
        <li>To understand, in aggregate, how the service is used so we can improve it.</li>
      </ul>
      <p>We do not sell your personal information. We do not use it for advertising.</p>

      <h2>Text messaging (SMS) and your mobile information</h2>
      <p>
        Text messages are optional. You choose to receive them by ticking an unticked box when you sign up or from your dashboard, and we confirm your number with a
        code before recurring texts begin. Message frequency varies (about 2-10 per week). Message and data rates may apply. Reply <strong>STOP</strong> to opt out at any
        time and <strong>HELP</strong> for help. See our <Link href="/sms">SMS Terms</Link>.
      </p>
      <p>
        <strong>
          No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. Text messaging originator opt-in data and consent
          will not be shared with any third parties.
        </strong>{" "}
        All the sharing categories described below exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.
      </p>

      <h2>Who we share information with</h2>
      <p>We share information only with service providers that process it on our behalf to run Not Buying, under confidentiality obligations:</p>
      <ul>
        <li>Twilio (text message delivery)</li>
        <li>Vercel (website hosting)</li>
        <li>Neon (database hosting)</li>
        <li>Anthropic (interpreting the free-form text of messages you send us, so we can log the right item and price)</li>
      </ul>
      <p>We may also disclose information if required by law. We never rent, sell or trade phone numbers or opt-in data.</p>

      <h2>Retention and security</h2>
      <p>
        We keep your information while your account is active. If you ask us to delete your account, we delete your personal information within 30 days, except where
        we must keep a record by law. We use encryption in transit (HTTPS), hashed PINs and restricted access to protect your data.
      </p>

      <h2>Your choices and rights</h2>
      <ul>
        <li>Turn texts off any time by replying STOP or from your dashboard.</li>
        <li>Ask for a copy of your data, a correction, or deletion of your account by emailing <a href="mailto:hello@notbuying.org">hello@notbuying.org</a>.</li>
      </ul>

      <h2>Children</h2>
      <p>Not Buying is not directed to children under 13, and we do not knowingly collect their information.</p>

      <h2>Changes</h2>
      <p>If we change this policy, we will update the date above and, for material changes, tell you on the site or by text if you have opted in.</p>

      <h2>Contact</h2>
      <p>
        Not Buying by Yardboat LLC · Atlanta, Georgia, USA · <a href="mailto:hello@notbuying.org">hello@notbuying.org</a>
      </p>
    </LegalShell>
  );
}
