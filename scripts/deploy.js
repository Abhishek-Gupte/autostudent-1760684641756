import { execSync } from "child_process";
import { writeFileSync } from "fs";

function run(cmd) {
  return execSync(cmd, { stdio: "pipe" }).toString().trim();
}

try { run('git add -A'); run('git commit -m "deploy: update docs"'); } catch {}
const sha = run("git rev-parse HEAD");
const origin = run("git remote get-url origin");
const repoHttp = origin.replace(/\.git$/, "").replace(/^git@github\.com:/, "https://github.com/");

// push
run("git push");

// try enable Pages main/docs (works if `gh` CLI is installed & authed)
try {
  run("gh api -X PUT repos/{owner}/{repo}/pages -f build_type=static -F source[branch]=main -F source[path]=/docs");
} catch {
  console.warn("If this fails, set Pages manually: Settings → Pages → Deploy from a branch → main /docs");
}

const m = repoHttp.match(/https:\/\/github\.com\/([^/]+)\/([^/]+)/);
const pagesUrl = m ? `https://${m[1]}.github.io/${m[2]}/` : "";

writeFileSync("deploy-meta.json", JSON.stringify({
  repo_url: repoHttp,
  commit_sha: sha,
  pages_url: pagesUrl
}, null, 2));

console.log("Pushed. Pages URL (may take ~1 min):", pagesUrl || "(set manually)");
