# Draft plan for `reset-sizes-extension`

## Specification Document — `reset-sizes-extension` (VS Code Extension)

### 0) Context / Goal

You want a VS Code extension that provides **one command + one shortcut** that resets **all “size-related” changes** back to defaults across the user’s environment as much as VS Code allows, including:

- UI zoom level (the “View: Zoom In/Out/Reset Zoom” behavior)
- Editor font zoom (the “Editor: Increase/Decrease/Reset Font Size” behavior)
- Terminal font zoom (the “Terminal: Increase/Decrease/Reset Font Size” behavior)
- Any relevant **settings-based font sizes** (e.g., `editor.fontSize`, `terminal.integrated.fontSize`) if the user wants them normalized
- “All windows” behavior (to the extent possible), especially around `window.zoomPerWindow`

Important: VS Code has **multiple concepts** that affect “size”:
1) **Window zoom** (UI zoom) via `window.zoomLevel`
2) **Editor font zoom** (not the same as `editor.fontSize`)
3) **Terminal font zoom** (not the same as `terminal.integrated.fontSize`)
4) **Settings-defined sizes** like `editor.fontSize`, `terminal.integrated.fontSize`, etc.

Your extension should unify these into one “Reset All Sizes” command.

---

### 1) Starting Point (Initial Structure Provided Earlier)

Start from this structure (as previously proposed):

```filetree
reset-sizes-extension
├── src
│   ├── extension.ts
│   ├── commands
│   │   └── resetAllSizes.ts
│   ├── types
│   │   └── index.ts
│   └── utils
│       └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

This document describes everything needed for another AI to implement the extension **without adding any more design decisions**.

---

### 2) Primary User Story

As a VS Code user, I can run a **single command** (and optionally a single keyboard shortcut) that:

1. Resets **UI zoom** to default
2. Resets **editor font zoom** to default
3. Resets **terminal font zoom** to default
4. Optionally resets/removes **size-related settings overrides** (user/workspace) to defaults
5. Optionally ensures zoom is **not per-window** so future zoom reset applies consistently across windows

---

### 3) Explicit Features to Implement

#### 3.1 Command: `Reset All Sizes`

Provide a single command available in:
- Command Palette
- Optionally the editor/context menu (nice-to-have)
- Optionally status bar (nice-to-have; not required)

The command executes the following steps in order:

**Step A — Reset UI zoom**
- Ensure window zoom is restored to default.
- Prefer calling the built-in command equivalent to “View: Reset Zoom” if available.
- If needed, set `window.zoomLevel` to `0`.

**Step B — Reset editor font zoom**
- Invoke the built-in “reset editor font zoom” command (equivalent to “Reset Editor Font Size”).
- Note: This is distinct from `editor.fontSize`.

**Step C — Reset terminal font zoom**
- Invoke the built-in “Terminal: Reset Font Size” command.
- If no terminal exists, this should still succeed (no crash). It may be a no-op.

**Step D — Reset size-related settings overrides (optional but requested)**
Reset size-related settings that can cause “things being bigger/smaller” even after zoom resets. This is tricky because “default” differs by platform/theme/user. The extension should support **two modes**:

- **Mode 1 (recommended default): “Reset zoom behaviors only”**
  - Only run Steps A–C.
  - Do not touch user settings like `editor.fontSize`.
  - Minimizes surprise.

- **Mode 2: “Hard reset size settings”**
  - Remove/restore default for a curated list of settings (see section 5).
  - Apply at chosen scope(s): Workspace, Workspace Folder, User.

**Step E — All windows expectation**
You asked: “reset all windows in current workspace”. VS Code extensions generally run in **one window context**. So the spec should:
- Make clear what can be done reliably:
  - If `window.zoomPerWindow` is set to `false`, then `window.zoomLevel` is global-ish and impacts new windows; but existing windows might still need a reload or manual action depending on how VS Code applies it.
- Provide an optional prompt: “Apply globally (set `window.zoomPerWindow=false`)?” and “Reload window now?” to ensure changes take effect.

---

### 4) Non-Functional Requirements

- Must be compatible with current stable VS Code (target recent engine range).
- Must not require external dependencies unless absolutely necessary.
- Must not modify unrelated settings.
- Must have clear user confirmation for any destructive action (removing user settings overrides).
- Must work on macOS (your environment), but should be cross-platform.

---

### 5) “Size-Related Settings” Inventory (Hard Reset Mode)

Define a conservative list of settings known to affect size. The extension should treat these as candidates to reset to default by **removing overrides** (i.e., set to `undefined` in configuration update, which reverts to default).

Suggested list (keep it minimal and safe):

**Window/UI**
- `window.zoomLevel`
- `window.zoomPerWindow` (optional normalization)

**Editor (settings-defined)**
- `editor.fontSize`
- `editor.lineHeight` (can dramatically change perceived size)
- `editor.fontLigatures` (not size, skip)
- `editor.fontFamily` (not size, skip)

**Terminal (settings-defined)**
- `terminal.integrated.fontSize`
- `terminal.integrated.lineHeight`

**Debug console / output**
- VS Code doesn’t expose many “font size” settings here; likely skip unless verified.

**Notebook / markdown preview**
- There are notebook/markdown-specific scaling options in some contexts; only include if verified and stable.

**Important**: The extension should document that “font zoom” and `fontSize` are different, and Hard Reset Mode addresses both.

---

### 6) Configuration / Settings for the Extension

Add extension settings to control behavior. Proposed settings (names can vary, but keep consistent and documented):

1) `resetSizes.mode`  
- `"zoomOnly"` (default)  
- `"hardReset"`  

2) `resetSizes.scopes` (only used in `hardReset`)
- Array or enum, e.g.:
  - `"workspace"`
  - `"workspaceFolder"`
  - `"user"`
- Default: `["workspace"]` to avoid touching global user configuration unexpectedly.

3) `resetSizes.includeWindowZoomPerWindow`
- boolean
- Default: `false` (only change if user opts in)

4) `resetSizes.promptBeforeHardReset`
- boolean
- Default: `true`

5) `resetSizes.reloadAfter`
- enum: `"never" | "prompt" | "always"`
- Default: `"prompt"`

6) `resetSizes.showSummaryNotification`
- boolean
- Default: `true`

---

### 7) UX / Flow Requirements

When running the command:

#### 7.1 If mode is `zoomOnly`
- Execute Steps A–C
- Show a toast notification: “Reset UI zoom, editor font zoom, terminal font zoom.”

#### 7.2 If mode is `hardReset`
- If `promptBeforeHardReset=true`, show a confirmation dialog:
  - Explain what will be reset and at which scopes.
  - Provide buttons:
    - “Proceed”
    - “Cancel”
- After applying:
  - Show summary of which items were reset/unchanged.

#### 7.3 Reload prompt
- If `reloadAfter="prompt"` and any configuration values were changed (especially `window.zoomLevel` or settings-based sizes), prompt:
  - “Reload VS Code window to apply all changes?”
  - Buttons: “Reload”, “Later”
- Use the standard reload command if needed.

---

### 8) Technical Implementation Requirements (What the Other AI Must Do)

#### 8.1 Register commands in package.json
- Contribute a command:
  - Command ID: e.g. `resetSizes.resetAll`
  - Title: “Reset All Sizes”
- Optionally contribute:
  - A second command for “Hard Reset Sizes (Settings + Zoom)” if you want explicit separation.

#### 8.2 Keybinding contribution (optional)
- You can ship a default keybinding, but it may conflict with users.
- Better: document how user can bind it.

#### 8.3 Activation events
- Activate on command invocation:
  - `onCommand:resetSizes.resetAll`

#### 8.4 Implement command behavior
In `src/commands/resetAllSizes.ts` implement orchestrator logic.

Core mechanisms the other AI must use:

1) **Executing built-in commands**
- Use VS Code command execution API to run:
  - Zoom reset command ID (built-in)
  - Editor font zoom reset command ID (built-in)
  - Terminal font reset command ID (built-in)

The other AI must verify the **exact IDs** (they are stable but must be confirmed). The intent is:
- UI zoom: `workbench.action.zoomReset`
- Editor font zoom: `editor.action.fontZoomReset`
- Terminal font zoom reset: `workbench.action.terminal.fontZoomReset`

2) **Updating configuration settings**
- Use `workspace.getConfiguration().update(key, value, target)`
- For “reset to default”, use `undefined` as value.
- Support targets:
  - User (Global)
  - Workspace
  - WorkspaceFolder (if applicable and supported)

3) **Multi-root workspace support**
- If the workspace has multiple folders, `workspaceFolder` scope updates must be applied per-folder.
- The command should either:
  - Apply to all folders, or
  - Prompt which folder(s) to apply to
- Default recommended: apply to all folders for consistency, but document this.

4) **Summary reporting**
- Track what was attempted and whether it succeeded:
  - `executedCommands`: list of command IDs executed
  - `updatedSettings`: list of { key, target, changed? }
  - `errors`: list of errors but don’t hard-fail unless critical

5) **Graceful failure**
- If terminal reset command fails because no terminal exists, do not crash; log and continue.

#### 8.5 Logging / Output channel (optional but useful)
- Create an OutputChannel, e.g. “Reset Sizes”
- Log each action and errors.

---

### 9) Files and Responsibilities

#### 9.1 `src/extension.ts`
Responsibilities:
- `activate(context)` registers the command(s)
- wires command IDs to functions in `commands/resetAllSizes`
- initializes output channel if used
- `deactivate()` optional

#### 9.2 `src/commands/resetAllSizes.ts`
Responsibilities:
- Implements `resetAllSizes()` main function
- Reads extension configuration
- Executes built-in commands (zoom resets)
- Applies optional hard reset configuration updates
- Shows notifications and reload prompt
- Returns a result object (for testability)

#### 9.3 `src/types/index.ts`
Responsibilities:
- Defines types like:
  - `ResetMode`
  - `ResetScope`
  - `ResetAllSizesResult`
  - `SettingChange`
  - etc.

#### 9.4 `src/utils/index.ts`
Responsibilities (examples):
- Utility to run a VS Code command with error handling
- Utility to update setting across scopes/folders
- Utility to show confirmation dialogs
- Utility to detect multi-root workspaces

---

### 10) Edge Cases / Expected Behaviors

- **No workspace opened**: command should still reset zooms and user settings (if configured), but workspace-scoped updates should be skipped.
- **Multi-root workspace**: apply workspaceFolder updates to each folder or prompt.
- **Restricted environment** (settings not writable): handle errors and show message.
- **Existing user preferences**: Hard Reset must be opt-in and clearly described.
- **Remote environments** (SSH/Containers): settings targets behave differently; still should work, but anticipate limitations.

---

### 11) Testing Requirements (Optional but Helpful)

If the other AI adds tests, focus on:
- Pure logic unit tests: scope resolution, settings list, result summaries
- Mocking VS Code API for command execution and configuration updates

Note: full integration testing in VS Code extension host is possible but heavier.

---

### 12) README Requirements

The README should include:

- What “Reset All Sizes” does
- Differences between:
  - UI zoom reset
  - Editor font zoom reset
  - Terminal font zoom reset
  - Settings-based font sizes
- How to bind a shortcut
- Explanation of “hard reset mode” and which settings it affects
- Multi-root workspace behavior
- Known limitations: “cannot truly force-reset other open windows unless zoom is global / reload, etc.”

---

### 13) Open Decisions the Other AI Must Finalize (But Constrained)

To avoid ambiguity, the other AI should **only** decide:

1) Exact command IDs for built-in commands (verify from VS Code docs / command list)
2) The final list of “size settings” (should remain conservative and documented)
3) Whether to apply workspaceFolder updates to all folders automatically or prompt (default: all)

Everything else in this spec should be implemented as described.

---

### 14) Acceptance Criteria (Definition of Done)

The extension is “done” when:

- Running **Reset All Sizes**:
  - Resets UI zoom
  - Resets editor font zoom
  - Resets terminal font zoom
- In **zoomOnly** mode, it does not alter user/workspace `fontSize` settings
- In **hardReset** mode, it removes overrides for the curated settings keys at the selected scope(s)
- Provides user confirmations before hard reset (unless disabled)
- Provides a reload prompt when configuration updates were applied (unless disabled)
- Works in a workspace and with no folder opened
- Handles errors without crashing and shows a brief summary/notification
