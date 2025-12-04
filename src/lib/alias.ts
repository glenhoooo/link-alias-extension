import { normalizeKey, Alias } from "./storage";

export type ParsedInput = { key: string; args: string[] };

export function parseAliasInput(raw: string): ParsedInput {
  const s = String(raw || "").trim();
  const withoutAt = s.replace(/^@+/, "");

  if (withoutAt.includes("/")) {
    const [k, ...rest] = withoutAt.split("/");
    return { key: normalizeKey(k ?? ""), args: rest.filter(Boolean) };
  }

  const parts = withoutAt.split(/\s+/).filter(Boolean);
  const [k, ...rest] = parts;
  return { key: normalizeKey(k ?? ""), args: rest };
}

export function isLikelyAliasQuery(q: string): boolean {
  const s = String(q || "").trim();
  return s.startsWith("@") && s.length >= 2;
}

export function resolveTargets(alias: Alias, args: string[]): string[] {
  const q = args.join(" ");
  return (alias.targets ?? []).map((t) => renderTemplate(t, { q, args }));
}

function renderTemplate(
  url: string,
  ctx: { q: string; args: string[] }
): string {
  let out = String(url);

  out = out.replaceAll("{{q}}", encodeURIComponent(ctx.q));
  out = out.replaceAll("{q}", encodeURIComponent(ctx.q));

  for (let i = 0; i < ctx.args.length; i++) {
    const v = encodeURIComponent(ctx.args[i]!);
    out = out.replaceAll(`{{arg${i}}}`, v);
    out = out.replaceAll(`{arg${i}}`, v);
    out = out.replaceAll(`{{${i}}}`, v);
    out = out.replaceAll(`{${i}}`, v);
  }

  return out;
}
