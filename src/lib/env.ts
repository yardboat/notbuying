import "server-only";

// Strip invisible characters that sneak in through copy-paste (a past key had one).
export function env(name: string): string | undefined {
  const v = process.env[name];
  if (!v) return undefined;
  const cleaned = v.replace(/[^\x21-\x7E]/g, "");
  return cleaned || undefined;
}

export const appUrl = () => {
  // Previews link to their own stable branch URL; production uses the configured domain.
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_BRANCH_URL) return `https://${process.env.VERCEL_BRANCH_URL}`;
  return (env("NEXT_PUBLIC_APP_URL") ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")).replace(/\/$/, "");
};

/**
 * Demo mode: until Twilio toll-free verification clears, carriers block outbound SMS.
 * In demo mode, signup skips the texted code and the in-app simulator stands in for SMS.
 * Turn off by setting DEMO_MODE=false once verification is approved.
 */
export const demoMode = () => (env("DEMO_MODE") ?? "true").toLowerCase() !== "false";
