/**
 * Generates content/projects.json from the backend's auto-summarized Repo Cards
 * plus content/overrides.json (ordering, featured flags, tagline overrides).
 *
 * Run from frontend/: node scripts/build-content.mjs
 * The output is committed, so Vercel builds never reach outside frontend/.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const cardsDir = join(here, "..", "..", "backend", "data", "repo_cards");
const contentDir = join(here, "..", "content");

const overrides = JSON.parse(readFileSync(join(contentDir, "overrides.json"), "utf8"));

// Keyed by filename — the card's repo_name field is model-written and
// inconsistently includes the owner prefix.
const byName = new Map(
  readdirSync(cardsDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => [f.replace(/\.json$/, ""), JSON.parse(readFileSync(join(cardsDir, f), "utf8"))]),
);
const order = overrides.order.filter((n) => byName.has(n));
// Cards not mentioned in overrides go last, alphabetically
const rest = [...byName.keys()].filter((n) => !order.includes(n) && !overrides.hide.includes(n)).sort();

function dedupe(items) {
  const seen = new Set();
  return items.filter((s) => {
    const k = String(s).toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

const projects = [...order, ...rest].map((name) => {
  const c = byName.get(name);
  const stack = c.tech_stack ?? {};
  return {
    name,
    url: `https://github.com/jiya-singhal/${name}`,
    featured: overrides.featured.includes(name),
    tagline: overrides.taglines?.[name] ?? c.one_line_purpose ?? "",
    problem: c.problem_solved ?? "",
    architecture: c.architecture_summary ?? "",
    features: c.key_features ?? [],
    tradeoffs: c.tradeoffs_and_limitations ?? [],
    demonstrates: c.what_it_demonstrates ?? "",
    complexity: c.complexity_level ?? "",
    languages: dedupe(stack.languages ?? []),
    frameworks: dedupe([...(stack.frameworks ?? []), ...(stack.key_libraries ?? [])]).slice(0, 8),
  };
});

writeFileSync(
  join(contentDir, "projects.json"),
  JSON.stringify({ generated_from: "backend/data/repo_cards", projects }, null, 2) + "\n",
);

console.log(`Wrote ${projects.length} projects (${projects.filter((p) => p.featured).length} featured) to content/projects.json`);
