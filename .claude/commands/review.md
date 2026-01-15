# Review Command

Code review checklist for the Reset Sizes extension.

## Input

$ARGUMENTS - Optional: specific files or commits to review. If empty, review all uncommitted changes.

## Instructions

### 1. Identify Changes

```bash
git status
git diff
```

List all modified files.

### 2. Run Automated Checks

```bash
npm run compile  # Type checking
npm run lint     # Code style
npm test         # Tests
```

All must pass before proceeding.

### 3. Review Each File

For each changed file, check:

#### Code Quality
- [ ] Follows existing patterns in the codebase
- [ ] No unnecessary complexity
- [ ] Functions are focused and reasonably sized
- [ ] Variable names are descriptive

#### TypeScript
- [ ] No `any` types (use `unknown` if needed)
- [ ] Explicit return types on functions
- [ ] Interfaces used for object shapes
- [ ] No type assertions without justification

#### Error Handling
- [ ] Async errors are caught
- [ ] User-facing errors use VS Code notifications
- [ ] Errors are logged to output channel
- [ ] Graceful degradation where appropriate

#### VS Code API Usage
- [ ] Configuration read with defaults
- [ ] Commands registered in activate()
- [ ] Resources added to context.subscriptions
- [ ] Appropriate notification types (info/warning/error)

#### Security
- [ ] No sensitive data logged
- [ ] No eval() or dynamic code execution
- [ ] User input validated if used

### 4. Test Coverage

- [ ] New functionality has tests
- [ ] Edge cases are tested
- [ ] Tests follow existing patterns
- [ ] Test names are descriptive

### 5. Documentation

- [ ] README updated if user-facing changes
- [ ] TESTING.md updated if test scenarios change
- [ ] Code comments for complex logic
- [ ] No commented-out code

### 6. Configuration Changes (if package.json modified)

- [ ] New settings have descriptions
- [ ] Defaults are sensible
- [ ] Enum values have enumDescriptions
- [ ] markdownDescription for complex settings

## Output Format

```markdown
## Code Review: [Description]

### Files Reviewed
- [file1.ts]
- [file2.ts]

### Automated Checks
- [ ] Compilation: PASS/FAIL
- [ ] Lint: PASS/FAIL
- [ ] Tests: PASS/FAIL

### Issues Found

#### Critical (must fix)
- [Issue description and location]

#### Suggestions (recommended)
- [Suggestion and reasoning]

#### Nitpicks (optional)
- [Minor improvement]

### Approval Status
- [ ] APPROVED - Ready to commit
- [ ] CHANGES REQUESTED - See issues above
```

## Common Issues to Watch For

### Anti-patterns
- Fire-and-forget promises (unhandled)
- Using `any` instead of proper types
- Catching errors without handling them
- Magic numbers/strings without constants

### VS Code Extension Specific
- Not disposing resources properly
- Blocking the extension host with sync operations
- Using deprecated VS Code APIs
- Not handling missing workspace scenarios

### This Repository Specific
- Not updating PRESET_CONFIGS when adding presets
- Forgetting to update ExtensionConfig interface
- Not handling all configuration scopes
- Missing output channel logging

## Quick Review Commands

```bash
# See what changed
git diff --stat

# Review specific file
git diff path/to/file.ts

# Check recent commits
git log --oneline -10

# Full verification
npm run compile && npm run lint && npm test
```
