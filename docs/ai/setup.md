# Development Setup

## Prerequisites

- **Node.js**: 18.x or higher
- **npm**: Included with Node.js
- **VS Code**: Latest stable version
- **Git**: For version control

## Initial Setup

```bash
# Clone the repository
git clone https://github.com/stavarengo/vscode-reset-ui-sizes-extension.git
cd vscode-reset-ui-sizes-extension

# Install dependencies
npm install

# Compile TypeScript
npm run compile
```

## Development Workflow

### 1. Start Watch Mode

```bash
npm run watch
```

This compiles TypeScript on every file change. Keep this running in a terminal.

### 2. Launch Extension Development Host

In VS Code:
1. Press `F5` (or Run > Start Debugging)
2. Select "Extension" configuration if prompted
3. A new VS Code window opens with your extension loaded

### 3. Test Your Changes

In the Extension Development Host window:
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
2. Type "Reset All Sizes"
3. Press Enter
4. Check the "Reset Sizes" output channel for logs

### 4. Run Automated Tests

```bash
npm test
```

Or in VS Code:
1. Press `F5` with "Extension Tests" configuration
2. Tests run in a VS Code test instance

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run compile` | One-time TypeScript compilation |
| `npm run watch` | Watch mode compilation |
| `npm test` | Run test suite |
| `npm run lint` | Run ESLint |

## Environment Variables

**None required.** This extension uses only VS Code APIs and has no external service dependencies.

## Secrets/Credentials

**None required.** The extension manipulates local VS Code settings only.

## Common Gotchas

### 1. "Cannot find module" errors

**Cause**: TypeScript not compiled
**Fix**: Run `npm run compile` or start `npm run watch`

### 2. Extension not loading changes

**Cause**: Need to reload Extension Development Host
**Fix**: Press `Ctrl+R` in the Extension Development Host window, or close and press F5 again

### 3. Tests fail with "Cannot connect"

**Cause**: VS Code test instance failed to launch
**Fix**: Close all VS Code windows and retry `npm test`

### 4. Terminal font zoom reset "fails"

**Expected behavior**: If no terminal is open, the command fails gracefully. This is normal.

### 5. Settings don't seem to change

**Cause**: Looking at wrong scope (user vs workspace)
**Fix**: Check the correct settings.json file for the configured scope

## Debug Configurations

The project includes VS Code launch configurations in `.vscode/launch.json`:

- **Extension**: Launch Extension Development Host
- **Extension Tests**: Run automated tests

## Output Locations

| Output | Location |
|--------|----------|
| Compiled JS | `dist/` |
| Test output | Console + VS Code test results |
| Extension logs | "Reset Sizes" output channel in VS Code |

## Building for Distribution

```bash
# Compile
npm run compile

# Package as .vsix (requires vsce)
npx vsce package
```

The `.vsix` file can be installed manually or published to the VS Code Marketplace.
