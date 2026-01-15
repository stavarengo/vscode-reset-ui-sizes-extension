# Dev Commands Reference

Copy-paste ready commands for common development tasks.

## Setup

```bash
# Install dependencies
npm install

# Compile TypeScript (one-time)
npm run compile
```

## Development

```bash
# Watch mode - recompiles on file changes
npm run watch
```

## Testing

```bash
# Run all tests
npm test

# Run tests with verbose output
npm test -- --reporter spec
```

## Linting

```bash
# Run ESLint
npm run lint

# Run ESLint with auto-fix
npm run lint -- --fix
```

## Building

```bash
# Production build
npm run compile

# Pre-publish build (same as compile)
npm run vscode:prepublish
```

## Packaging

```bash
# Package as .vsix (requires vsce)
npx vsce package

# Install locally for testing
code --install-extension reset-sizes-extension-*.vsix
```

## Git

```bash
# Check status
git status

# Stage all changes
git add .

# Commit with message
git commit -m "feat: description of change"

# Push to remote
git push origin main
```

## Debugging in VS Code

```
F5                      Launch Extension Development Host
Ctrl+Shift+P            Command Palette (in dev host)
Ctrl+R                  Reload Extension Development Host
Ctrl+Shift+U            Open Output panel
```

## Quick Verification

```bash
# Full verification before commit
npm run compile && npm run lint && npm test
```

## Common Workflows

### Make a change and test

```bash
npm run watch          # Terminal 1 - keep running
# Press F5 in VS Code  # Launches dev host
# Test in dev host
# Ctrl+R to reload after changes
```

### Run tests after changes

```bash
npm run compile && npm test
```

### Prepare for PR

```bash
npm run compile && npm run lint && npm test && git status
```

## VS Code Extension Commands

These are the commands the extension provides (not dev commands):

| Command ID | Title | Description |
|------------|-------|-------------|
| `resetSizes.resetAll` | Reset All Sizes | Reset zoom and size settings |

## Environment

| Requirement | Version |
|-------------|---------|
| Node.js | ^18.x |
| VS Code | ^1.74.0 |
| npm | (included with Node) |
