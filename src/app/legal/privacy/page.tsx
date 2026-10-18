import LegalShell from "../../legal-shell";

export const metadata = { title: "Privacy · Donate the Difference" };

export default function Privacy() {
  return (
    <LegalShell title="Privacy policy" updated="October 18, 2026">
      <p>Donate the Difference (&ldquo;we&rdquo;) is operated by Yardboat LLC. This policy explains what we collect and why.</p>

      <h2>What we collect</h2>
      <ul>
        <li>Your mobile phone number, used to identify your account and to text you.</li>
        <li>Your first name (optional) and your savings goal.</li>
        <li>The messages you send us, which describe items you chose not to buy and their prices.</li>
        <li>Records of donations you start through Every.org from our site (charity, amount, whether you confirmed it).</li>
        <li>Basic, anonymous usage analytics.</li>
      </ul>

      <h2>How we use it</h2>
      <p>Only to run the service: record your skips, calculate goal progress and pledges, reply to your texts, send your weekly recap, and improve the product.</p>

      <h2>What we never do</h2>
      <ul>
        <li>We do not sell, rent or share your phone number or messages with third parties for marketing.</li>
        <li>Mobile opt-in data and consent are never shared with third parties or affiliates for marketing purposes.</li>
        <li>We do not hold, move or have access to your money. Donations happen directly between you and Every.org.</li>
      </ul>

      <h2>Service providers</h2>
      <p>
        We use Twilio (text messaging), Vercel (hosting), Neon (database) and Anthropic (to interpret free-form messages). They process data only to provide these services to us.
      </p>

      <h2>Your choices</h2>
      <p>Reply STOP to stop texts. Email hello@notbuying.org to delete your account and data; we&apos;ll do it within 30 days.</p>
    </LegalShell>
  );
}
