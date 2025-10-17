// src/github.js
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const sh = (cmd, cwd) =>
  execSync(cmd, { cwd, stdio: ["pipe", "pipe", "inherit"] }).toString();

export function createRepoWithPages(repoName, brief = "Auto-generated site") {
  // 1) write minimal site to generated/<repoName>
  const base = path.join(process.cwd(), "generated", repoName);
  fs.rmSync(base, { recursive: true, force: true });
  fs.mkdirSync(base, { recursive: true });

  const indexHtml =
    "<!doctype html><html><head><meta charset=\"utf-8\"><title>" +
    repoName +
    "</title></head><body><h1>" +
    repoName +
    "</h1><p id=\"brief\"></p>" +
    "<script>document.getElementById('brief').textContent=" +
    JSON.stringify(brief) +
    ";</script></body></html>";
  fs.writeFileSync(path.join(base, "index.html"), indexHtml, "utf-8");

  const readme =
    "# " +
    repoName +
    "\n\n" +
    brief +
    "\n\nDeployed via GitHub Pages.";
  fs.writeFileSync(path.join(base, "README.md"), readme, "utf-8");

  // 2) add a minimal Pages workflow
  const wfDir = path.join(base, ".github", "workflows");
  fs.mkdirSync(wfDir, { recursive: true });
  const pagesYml = `name: Deploy Pages
on:
  push:
    branches: [ main ]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: .
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
`;
  fs.writeFileSync(path.join(wfDir, "pages.yml"), pagesYml, "utf-8");

  // 3) init git + initial commit
  sh("git init -b main", base);
  if (process.env.GIT_EMAIL) sh(`git config user.email "${process.env.GIT_EMAIL}"`, base);
  if (process.env.GIT_USER)  sh(`git config user.name "${process.env.GIT_USER}"`, base);
  fs.writeFileSync(
    path.join(base, "LICENSE"),
    "MIT License\n\nCopyright (c) "
      + new Date().getFullYear()
      + " "
      + (process.env.GIT_USER || "")
      + "\n"
  );
  sh('git add .', base);
  sh('git commit -m "chore: initial commit + pages workflow"', base);

  // 4) create GH repo and push (requires: gh auth login)
  const owner = process.env.GIT_USER;
  if (!owner) throw new Error("GIT_USER missing in .env");
  sh(`gh repo create ${owner}/${repoName} --public --source=. --remote=origin --push`, base);

  // 5) return URLs
  const commitSha = sh("git rev-parse HEAD", base).trim();
  return {
    repo_url: `https://github.com/${owner}/${repoName}`,
    pages_url: `https://${owner}.github.io/${repoName}/`,
    commit_sha: commitSha,
  };
}
