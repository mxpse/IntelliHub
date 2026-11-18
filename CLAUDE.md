<!-- BEGIN zero-open-pr-policy -->
## Pull request policy: zero open PRs, no GitHub Actions (mandatory, Art 2026-11-18)

- **The goal is zero open PRs**, reached by prompt review, merge or closure. Many PRs may be open and worked on at
  once; there is no single-PR restriction and PRs never block each other.
- **Track every open PR's age** from its creation time (`gh pr list --state open --json number,title,createdAt,
  isDraft,reviewDecision,mergeStateStatus`). Check it at the start of any session that touches GitHub.
- **8 hours is the limit.** A PR open 8 hours or longer is the highest priority. Before creating new PRs or doing
  unrelated work, resolve it: merge after required validation, or close it with a documented reason (abandoned,
  superseded by #N, unnecessary) in a PR comment. Never bypass review, validation or merge-conflict checks to beat
  the clock.
- **Blocked? Escalate to Rook immediately** with an actionable remediation plan (blocker, fix, owner of the next
  step, when), through the Rook agent gateway (`https://agents.aaoellis.com/agent/v1`; in mxpse/sloan,
  `scripts/pr_hygiene.py escalate <n> "<plan>"`), and note the escalation on the PR. Only a resolved or escalated
  8h+ PR stops blocking new PRs.
- **Merge** only when explicitly authorized and every required check passes. Close abandoned, superseded or
  unnecessary PRs with the reason. Never let stale PRs accumulate.
- **Do not use GitHub Actions for any purpose.** GitHub is for source control and pull request management, not
  workflow orchestration. No workflows, triggers, scheduled jobs or Actions automation; never dispatch, re-run or
  approve a run. Build, test, lint and validation run locally or on the self-hosted orchestration path, outside
  GitHub Actions.
<!-- END zero-open-pr-policy -->
