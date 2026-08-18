import { NextResponse } from "next/server";

export const revalidate = 300;

const USER = "jiya-singhal";
const REPO_COUNT = 6; // most-recently-pushed repos to pull commits from
const COMMITS_PER_REPO = 4;

type FeedItem = {
  repo: string;
  message: string;
  sha: string;
  url: string;
  at: string;
};

type Repo = { name: string; pushed_at: string; fork: boolean };
type Commit = {
  sha: string;
  html_url: string;
  commit: { message: string; author: { date: string } };
};

function ghHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "jiya-portfolio",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

export async function GET() {
  const headers = ghHeaders();

  const reposResp = await fetch(
    `https://api.github.com/users/${USER}/repos?sort=pushed&per_page=12&type=owner`,
    { headers, next: { revalidate: 300 } },
  );
  if (!reposResp.ok) {
    return NextResponse.json({ items: [], error: `GitHub ${reposResp.status}` });
  }

  const repos = ((await reposResp.json()) as Repo[])
    .filter((r) => !r.fork)
    .slice(0, REPO_COUNT);

  const perRepo = await Promise.all(
    repos.map(async (r) => {
      const resp = await fetch(
        `https://api.github.com/repos/${USER}/${r.name}/commits?per_page=${COMMITS_PER_REPO}`,
        { headers, next: { revalidate: 300 } },
      );
      if (!resp.ok) return [] as FeedItem[];
      const commits = (await resp.json()) as Commit[];
      return commits.map((c) => ({
        repo: r.name,
        message: c.commit.message.split("\n")[0],
        sha: c.sha.slice(0, 7),
        url: c.html_url,
        at: c.commit.author.date,
      }));
    }),
  );

  const items = perRepo
    .flat()
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 14);

  return NextResponse.json({ items });
}
