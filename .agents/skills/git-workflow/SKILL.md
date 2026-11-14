---
name: git-workflow
description: Git conventions for the team (branches, small commits, Conventional Commits). Use when committing, branching or preparing a push.
---

# Git workflow

- Work on short-lived branches off `main`: `feat/<topic>`, `fix/<topic>`, `docs/<topic>`. Merge often; avoid long-lived branches.
- Commit small and often (every working step). Conventional Commits in English: `feat: add burn-rate chart`, `fix: handle missing units`, `docs: update README`, `chore: ...`.
- Never commit secrets, `.env`, large raw datasets or build output (see `.gitignore`). Small samples go in `data/sample/`.
- Pull/rebase before pushing; resolve conflicts immediately, don't let them pile up.
- Never force-push `main`. Never rewrite someone else's branch.
- After feature freeze (Sunday 16:00): only `fix:` and `docs:` commits.
- Tag the submitted version: `git tag submission-v1` before Sunday 23:00.
