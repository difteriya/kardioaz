/**
 * Next.js instrumentation — runs once on server boot. Starts the booking cron
 * jobs in the Node.js runtime only (not edge). See lib/cron.ts.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startCron } = await import("@/lib/cron");
    startCron();
  }
}
