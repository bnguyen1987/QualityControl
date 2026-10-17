import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

// Runs once a day by itself (Netlify scheduled function). Deletes archived photos older than
// KEEP_DAYS so storage doesn't grow forever. Change KEEP_DAYS to keep photos longer or shorter.
const KEEP_DAYS = 365;

export default async () => {
  const s = getStore({ name: "qc-photos", consistency: "strong" });
  const cutoff = Date.now() - KEEP_DAYS * 864e5;
  const { blobs } = await s.list({ prefix: "meta/" });
  let removed = 0;
  for (const b of blobs) {
    // keys look like meta/<ORDER>/<15-digit timestamp>-<random>
    const id = b.key.split("/").pop() || "";
    const ts = Number(id.split("-")[0]);
    if (!Number.isFinite(ts) || ts >= cutoff) continue;
    const order = b.key.split("/")[1];
    await s.delete(`img/${order}/${id}.jpg`);
    await s.delete(b.key);
    removed++;
  }
  // drop orders that no longer have any photos from the recent-orders list
  if (removed) {
    const idx: any = await s.get("index/recent", { type: "json" });
    if (Array.isArray(idx)) await s.setJSON("index/recent", idx.filter((o: any) => o.ts >= cutoff));
  }
  console.log(`Photo cleanup: removed ${removed} photo(s) older than ${KEEP_DAYS} days`);
};

export const config: Config = { schedule: "@daily" };
