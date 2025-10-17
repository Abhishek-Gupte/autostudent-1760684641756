import { execSync } from "child_process";
import dotenv from "dotenv";
dotenv.config();

const user = process.env.GITHUB_USERNAME;
if (!user) {
  console.error("Set GITHUB_USERNAME in .env");
  process.exit(1);
}

const repo = `autostudent-${Date.now()}`;

try {
  execSync("git init", { stdio: "inherit" });
  execSync("git add -A", { stdio: "inherit" });
  execSync('git commit -m "init: scaffolding"', { stdio: "inherit" });

  try {
    execSync(`gh repo create ${user}/${repo} --public --source=. --push`, { stdio: "inherit" });
  } catch {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.error("Install GitHub CLI (`gh`) or set GITHUB_TOKEN in .env");
      process.exit(1);
    }
    execSync(`git remote add origin https://${token}@github.com/${user}/${repo}.git`, { stdio: "inherit" });
    execSync("git branch -M main", { stdio: "inherit" });
    execSync("git push -u origin main", { stdio: "inherit" });
  }

  console.log(`Repo created: https://github.com/${user}/${repo}`);
  console.log("Next: npm run deploy (will enable Pages).");
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
