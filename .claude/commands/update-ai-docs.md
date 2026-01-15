# Update AI Docs Command

Re-sync AI documentation after code changes.

## Input

$ARGUMENTS - Optional: specific aspect to update (e.g., "architecture", "commands", "ownership")

## Instructions

### 1. Analyze Current State

Review recent changes:
```bash
git log --oneline -20
git diff HEAD~5 --stat
```

### 2. Check Each Documentation File

#### CLAUDE.md
- [ ] Quick reference commands still accurate
- [ ] Repository structure matches actual layout
- [ ] Key files list is current
- [ ] Architecture summary reflects current design

#### AGENTS.md
- [ ] Agent types still relevant
- [ ] Handoff rules match workflow
- [ ] Key files per agent are accurate

#### docs/ai/overview.md
- [ ] System description is accurate
- [ ] Flow diagram reflects current behavior
- [ ] Key concepts are up to date

#### docs/ai/setup.md
- [ ] Prerequisites are current
- [ ] Commands work as documented
- [ ] Common gotchas still apply

#### docs/ai/architecture.md
- [ ] Module breakdown is accurate
- [ ] Data flow diagram is current
- [ ] Extension lifecycle is correct

#### docs/ai/conventions.md
- [ ] Coding patterns match actual code
- [ ] Examples are from real code
- [ ] Testing style matches test files

#### docs/ai/ownership.md
- [ ] File purposes are accurate
- [ ] "When to modify" sections are helpful
- [ ] Common change patterns are current

#### docs/ai/commands.md
- [ ] All commands work
- [ ] No deprecated commands listed
- [ ] New commands are documented

### 3. Update Process

For each doc that needs updates:

1. Read the current documentation
2. Read the corresponding source code
3. Identify discrepancies
4. Update documentation to match code
5. Keep documentation concise and accurate

### 4. Verify Updates

- [ ] No broken internal links
- [ ] Code examples compile (if shown)
- [ ] Commands execute successfully
- [ ] File paths exist

## Output Format

```markdown
## AI Documentation Update

### Files Reviewed
- [x] CLAUDE.md - [status]
- [x] AGENTS.md - [status]
- [x] docs/ai/overview.md - [status]
- [x] docs/ai/setup.md - [status]
- [x] docs/ai/architecture.md - [status]
- [x] docs/ai/conventions.md - [status]
- [x] docs/ai/ownership.md - [status]
- [x] docs/ai/commands.md - [status]

### Changes Made
- [file]: [what was updated]

### No Changes Needed
- [file]: Still accurate

### Summary
[Brief description of update scope]
```

## When to Run This Command

- After adding new features
- After significant refactoring
- After changing configuration options
- After modifying the build process
- Before major releases
- When onboarding new contributors

## Tips

- Keep documentation concise - avoid redundancy
- Use actual code examples when possible
- Update diagrams if architecture changes
- Remove documentation for deleted features
- Cross-reference related docs
