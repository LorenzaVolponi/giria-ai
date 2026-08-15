import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const productionSmoke = readFileSync(resolve(root, ".github/workflows/production-smoke.yml"), "utf8");
const indexNow = readFileSync(resolve(root, ".github/workflows/indexnow.yml"), "utf8");
const smokeScript = readFileSync(resolve(root, "scripts/post-deploy-smoke.sh"), "utf8");

describe("production discovery ordering", () => {
  it("requires the exact Git commit to be live before the production smoke can pass", () => {
    expect(productionSmoke).toContain("EXPECTED_COMMIT_SHA");
    expect(productionSmoke).toContain("github.sha");
    expect(smokeScript).toContain("EXPECTED_COMMIT_SHA");
    expect(smokeScript).toContain("/api/v1/health");
    expect(smokeScript).toContain("JSON.parse(input).commit");
    expect(smokeScript).toContain("produção não chegou ao commit");
  });

  it("submits IndexNow only after a successful production smoke", () => {
    expect(indexNow).toContain("workflow_run:");
    expect(indexNow).toContain('workflows: ["Production Surface Smoke"]');
    expect(indexNow).toContain("github.event.workflow_run.conclusion == 'success'");
    expect(indexNow).toContain("github.event.workflow_run.event == 'push'");
    expect(indexNow).toContain("github.event.workflow_run.head_branch == 'main'");
    expect(indexNow).toContain("if: github.event_name == 'workflow_run'");
    expect(indexNow).not.toContain("if: github.event_name == 'push'");
  });

  it("keeps pull requests as dry-run only", () => {
    expect(indexNow).toContain("pull_request:");
    expect(indexNow).toContain("INDEXNOW_DRY_RUN: \"1\"");
    expect(indexNow).toContain("INDEXNOW_ALL_CORE: \"1\"");
  });
});
