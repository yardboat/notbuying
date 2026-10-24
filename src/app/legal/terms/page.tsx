import Link from "next/link";
import LegalShell from "../../legal-shell";

export const metadata = { title: "Terms · Not Buying" };

export default function Terms() {
  return (
    <LegalShell title="Terms of Service" updated="October 24, 2026">
      <p>
        These terms cover your use of Not Buying at <Link href="/">notbuying.org</Link>, a service operated by <strong>Yardboat LLC</strong>, Atlanta, Georgia, USA.
        By creating an account you agree to them. Contact: <a href="mailto:hello@notbuying.org">hello@notbuying.org</a>.
      </p>

      <h2>What Not Buying is</h2>
      <p>
        A tool for logging purchases you chose not to make. The amounts counted toward your goal and the pledges to charities are records you create. They are not
        deposits, savings accounts or donations until you choose to give.
      </p>

      <h2>Your account</h2>
      <p>You sign in with your mobile number and a PIN. Keep your PIN private. You are responsible for what is logged on your account.</p>

      <h2>Text messages (optional)</h2>
      <p>
        Texting is optional and not required to use Not Buying. If you opt in, our <Link href="/sms">SMS Terms</Link> apply. Reply STOP to opt out at any time and
        HELP for help. Message and data rates may apply.
      </p>

      <h2>Donations</h2>
      <p>
        Pledges are suggestions calculated as 10% of what you skipped. Any donation is made by you directly to the charity through Every.org, under Every.org&apos;s
        terms. We don&apos;t process payments and make no claims about the tax treatment of your donations. Impact figures (like meals) come from the charity&apos;s
        own published numbers and are approximate.
      </p>

      <h2>Acceptable use</h2>
      <p>Don&apos;t misuse the service, attempt to access other people&apos;s accounts, or send abusive content to our number.</p>

      <h2>No warranty; limitation of liability</h2>
      <p>
        The service is provided as-is. To the extent the law allows, Yardboat LLC is not liable for indirect or consequential losses arising from your use of the
        service. We may change or end the service at any time.
      </p>

      <h2>Privacy</h2>
      <p>See our <Link href="/privacy">Privacy Policy</Link>.</p>

      <h2>Contact</h2>
      <p>
        Not Buying by Yardboat LLC · Atlanta, Georgia, USA · <a href="mailto:hello@notbuying.org">hello@notbuying.org</a>
      </p>
    </LegalShell>
  );
}
