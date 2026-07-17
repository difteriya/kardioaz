import "server-only";
import cron from "node-cron";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Background jobs (PROJECT-PLAN.md §14.3): release expired holds back to open,
 * and purge personal data for completed consultations. Runs in-process via
 * node-cron. On the VPS this is the same code; on shared hosting it wouldn't
 * run, which is why Phase 4 targets a VPS (§4).
 */
let started = false;

export function startCron() {
  if (started) return;
  started = true;

  cron.schedule("*/5 * * * *", async () => {
    try {
      const db = createAdminClient();
      const [released, purged] = await Promise.all([
        db.rpc("release_expired_holds"),
        db.rpc("purge_completed_appointments"),
      ]);
      if (released.data || purged.data) {
        console.log(`[cron] released ${released.data ?? 0}, purged ${purged.data ?? 0}`);
      }
    } catch (e) {
      console.error("[cron] job failed:", (e as Error).message);
    }
  });

  console.log("[cron] booking jobs scheduled (every 5 min)");
}
