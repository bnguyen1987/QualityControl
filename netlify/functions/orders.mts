import type { Context, Config } from "@netlify/functions";
import { getStore, getDeployStore } from "@netlify/blobs";

// Remembers each order's customer and quantity, shared by every machine.
// When an order is scanned on the next machine, its details fill in automatically.
//   GET  /api/orders?order=123   -> { order, customer, qty } or {}
//   POST /api/orders             { order, customer, qty }

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

function store() {
  if (Netlify.context?.deploy?.context === "production") return getStore({ name: "qc-orders", consistency: "strong" });
  return getDeployStore({ name: "qc-orders" });
}

function checkAccess(req: Request): Response | null {
  const code = Netlify.env.get("QC_ACCESS_CODE");
  if (!code) return json({ error: "setup", message: "QC_ACCESS_CODE is not set on the Netlify site." }, 500);
  if (req.headers.get("x-access-code") !== code) return json({ error: "access" }, 401);
  return null;
}

const str = (v: unknown, n: number) => String(v ?? "").slice(0, n).trim();
const orderKey = (v: unknown) => str(v, 40).toUpperCase().replace(/[^A-Z0-9-]/g, "");

export default async (req: Request, context: Context) => {
  const denied = checkAccess(req);
  if (denied) return denied;
  const s = store();
  const url = new URL(req.url);

  if (req.method === "GET") {
    const key = orderKey(url.searchParams.get("order"));
    if (!key) return json({ error: "bad_request" }, 400);
    const d = await s.get("o/" + key, { type: "json" });
    return json(d || {});
  }

  if (req.method === "POST") {
    let b: any;
    try { b = await req.json(); } catch { return json({ error: "bad_request" }, 400); }
    const key = orderKey(b.order);
    if (!key) return json({ error: "bad_request" }, 400);
    const prev: any = (await s.get("o/" + key, { type: "json" })) || {};
    // only overwrite a field when a value was given, so one machine can't blank out another's entry
    const rec = {
      order: str(b.order, 40),
      customer: str(b.customer, 120) || prev.customer || "",
      qty: str(b.qty, 20) || prev.qty || "",
      updated: Date.now(),
    };
    await s.setJSON("o/" + key, rec);
    return json({ ok: true });
  }

  return json({ error: "method" }, 405);
};

export const config: Config = { path: "/api/orders" };
