# Issue Management

This repository uses a small, consistent label set and Cognivyn Project 3 to
keep triage visible. Apply labels based on the issue's primary purpose; add a
priority label only when urgency is known.

## Labels

| Label | Use for |
| --- | --- |
| `bug` | Incorrect, broken, or unsafe behavior |
| `enhancement` | A user-facing improvement or new capability |
| `testing` | Test coverage, fixtures, or quality improvements |
| `documentation` | README, usage, examples, or maintainer documentation |
| `security` | Security-sensitive behavior or disclosure work |
| `maintenance` | CI, packaging, dependencies, and repository upkeep |
| `good first issue` | A self-contained task suitable for a new contributor |
| `priority:high` | Blocks releases, causes data loss, or has a security impact |
| `priority:medium` | Important planned work without an urgent deadline |
| `priority:low` | Useful work that can wait behind current priorities |

Do not use labels as a substitute for the issue title or acceptance criteria.
Issues may have multiple category labels, but normally have at most one
priority label.

## Project 3 workflow

Use the following status flow for issues in
[Cognivyn Project 3](https://github.com/orgs/Cognivyn/projects/3):

| Event | Project action |
| --- | --- |
| Issue opened | Add to Project 3 and set status to `Triage` |
| Triage completed | Set status to `Todo`, `In Progress`, or `Done` |
| Issue assigned or pull request opened | Set status to `In Progress` |
| Linked pull request merged | Set status to `Done` |
| Issue closed without a pull request | Set status to `Done` |

Priority and category labels are maintained independently of status. A
maintainer may move an issue manually when automation cannot infer intent.

## Automation checklist

When configuring or auditing Project 3 automation:

1. Confirm newly opened issues are added and start in `Triage`.
2. Confirm assignment and linked pull requests move work to `In Progress`.
3. Confirm merged pull requests and closed issues move work to `Done`.
4. Create one temporary test issue, verify each transition, then close it.
5. Check that existing open issues have a category label and, where needed, a
   priority label.

