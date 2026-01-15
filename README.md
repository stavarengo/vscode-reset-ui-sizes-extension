# Reset Sizes for VS Code

A VS Code extension that provides a single command to reset all size-related changes (UI zoom, editor font zoom, terminal font zoom, and optionally size-related settings) back to defaults.

## Features

- **Single Command**: Reset all zooms and size settings with one command
- **Two Modes**:
  - **zoomOnly** (default): Resets zoom behaviors only, without touching fontSize settings
  - **hardReset**: Also removes size-related settings overrides
- **Flexible Configuration**: Choose which scopes to reset (user, workspace, workspace folder)
- **User-Friendly**: Confirmations before destructive actions, reload prompts when needed

## What Gets Reset

### zoomOnly Mode (Default)

Resets these zoom behaviors by executing VS Code commands:
- **UI Zoom** (`workbench.action.zoomReset`) - The overall window zoom level
- **Editor Font Zoom** (`editor.action.fontZoomReset`) - Font zoom in editors (different from font size)
- **Terminal Font Zoom** (`workbench.action.terminal.fontZoomReset`) - Font zoom in terminals

### hardReset Mode

In addition to the zoom resets above, also removes overrides for these settings:
- `window.zoomLevel`
- `window.zoomPerWindow` (optional, disabled by default)
- `editor.fontSize`
- `editor.lineHeight`
- `terminal.integrated.fontSize`
- `terminal.integrated.lineHeight`

## Key Concepts

### Zoom vs Font Size

VS Code has two different concepts for text size:

1. **Font Zoom**: Dynamic zoom controlled by Ctrl/Cmd + Mouse Wheel in editor/terminal
   - Temporary, per-session behavior
   - Not persisted in settings files
   - Reset by zoom commands

2. **Font Size**: The `fontSize` setting in settings.json
   - Permanent configuration
   - Persisted in settings files
   - Only reset in hardReset mode

### UI Zoom

The `window.zoomLevel` setting controls the zoom of the entire VS Code window (all UI, not just text). This is different from editor/terminal font zoom.

## Usage

### Command Palette

1. Open Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS)
2. Type "Reset All Sizes"
3. Press Enter

The extension will:
- Execute zoom reset commands
- (In hardReset mode) Prompt for confirmation, then remove size setting overrides
- Show a summary notification
- (Optional) Prompt to reload the window

### Keyboard Shortcut

You can bind a keyboard shortcut to the command:

1. Open Keyboard Shortcuts (`Ctrl+K Ctrl+S` or `Cmd+K Cmd+S` on macOS)
2. Search for "Reset All Sizes"
3. Click the + icon and assign your preferred shortcut

Example keybinding in `keybindings.json`:
```json
{
  "key": "ctrl+alt+0",
  "command": "resetSizes.resetAll"
}
```

## Configuration

All settings are under the `resetSizes` namespace in VS Code settings.

### `resetSizes.mode`

**Type**: `string` (enum: `"zoomOnly"`, `"hardReset"`)
**Default**: `"zoomOnly"`

Reset mode:
- `zoomOnly`: Resets zoom behaviors only, without touching fontSize settings
- `hardReset`: Also removes size-related settings overrides

```json
{
  "resetSizes.mode": "zoomOnly"
}
```

### `resetSizes.scopes`

**Type**: `array` of `string` (enum: `"user"`, `"workspace"`, `"workspaceFolder"`)
**Default**: `["workspace"]`

Configuration scopes to apply hard reset. Only used in hardReset mode.

```json
{
  "resetSizes.scopes": ["workspace"]
}
```

- `user`: Reset user-level settings (Global settings)
- `workspace`: Reset workspace-level settings (.vscode/settings.json)
- `workspaceFolder`: Reset workspace folder settings (in multi-root workspaces)

### `resetSizes.includeWindowZoomPerWindow`

**Type**: `boolean`
**Default**: `false`

Whether to reset `window.zoomPerWindow` setting in hard reset mode.

```json
{
  "resetSizes.includeWindowZoomPerWindow": false
}
```

Note: `window.zoomPerWindow` controls whether zoom levels are remembered per-window. Resetting it may affect your window zoom behavior.

### `resetSizes.promptBeforeHardReset`

**Type**: `boolean`
**Default**: `true`

Show confirmation dialog before applying hard reset.

```json
{
  "resetSizes.promptBeforeHardReset": true
}
```

### `resetSizes.reloadAfter`

**Type**: `string` (enum: `"never"`, `"prompt"`, `"always"`)
**Default**: `"prompt"`

When to reload window after reset:
- `never`: Never reload automatically
- `prompt`: Prompt user to reload if settings were changed
- `always`: Always reload immediately

```json
{
  "resetSizes.reloadAfter": "prompt"
}
```

### `resetSizes.showSummaryNotification`

**Type**: `boolean`
**Default**: `true`

Show notification with summary of reset actions.

```json
{
  "resetSizes.showSummaryNotification": true
}
```

## Configuration Examples

### Example 1: Quick zoom reset (default)

```json
{
  "resetSizes.mode": "zoomOnly"
}
```

Just resets zoom behaviors, no settings are touched.

### Example 2: Complete reset of workspace settings

```json
{
  "resetSizes.mode": "hardReset",
  "resetSizes.scopes": ["workspace"],
  "resetSizes.promptBeforeHardReset": true,
  "resetSizes.reloadAfter": "prompt"
}
```

Resets zooms and removes size-related settings from workspace, with confirmation and reload prompt.

### Example 3: Reset everything across all scopes

```json
{
  "resetSizes.mode": "hardReset",
  "resetSizes.scopes": ["user", "workspace", "workspaceFolder"],
  "resetSizes.includeWindowZoomPerWindow": true,
  "resetSizes.promptBeforeHardReset": true,
  "resetSizes.reloadAfter": "always"
}
```

Nuclear option: resets everything everywhere, including window.zoomPerWindow, and reloads immediately.

## Multi-Root Workspaces

In multi-root workspaces, when `workspaceFolder` scope is selected, the extension will apply setting resets to **all workspace folders** by default.

## Known Limitations

1. **Other Open Windows**: Cannot force-reset zoom in other open VS Code windows unless `window.zoomPerWindow` is disabled (zoom is global).

2. **Settings Require Reload**: Some setting changes require a window reload to take full effect. The extension prompts for reload when appropriate.

3. **Remote Environments**: In remote development scenarios (Remote SSH, WSL, Dev Containers), some settings may have restrictions on writability.

4. **Terminal May Not Exist**: The terminal font zoom reset may fail gracefully if no terminal is currently open. This is expected behavior and not an error.

5. **Confirmation Dialog**: The hard reset confirmation is a modal dialog that will block the UI until user responds.

## Output Channel

The extension logs detailed information to the "Reset Sizes" output channel. To view:

1. Open Output panel (`View > Output` or `Ctrl+Shift+U`)
2. Select "Reset Sizes" from the dropdown

This is useful for debugging or understanding what the extension did.

## Development

### Building from Source

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Run tests
npm test
```

### Running the Extension

1. Open the project in VS Code
2. Press F5 to launch Extension Development Host
3. In the new window, test the "Reset All Sizes" command

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

## Credits

Created as a utility to quickly reset all zoom and size-related customizations in VS Code, useful when:
- Sharing screenshots or screen recordings
- Troubleshooting display issues
- Resetting after accidental zoom changes
- Preparing workspaces for fresh starts
