import { database } from "../../lib/database.mjs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await database().query("SELECT 1 FROM guide_launches LIMIT 1");
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
