# Migration Guide: v0.x to v1.0.0

Version 1.0.0 introduces a completely new configuration model for the Reset Sizes extension. The old mode-based system has been replaced with a flexible preset and command-list system that gives you full control over what gets reset.

## Breaking Changes

### Configuration Schema Changes

The following configuration properties have been **removed**:
- `resetSizes.mode` (replaced by `resetSizes.preset`)
- `resetSizes.includeWindowZoomPerWindow` (no longer needed)
- `resetSizes.promptBeforeHardReset` (renamed to `resetSizes.promptBeforeReset`)

The following configuration properties have been **added**:
- `resetSizes.preset` - Choose from "zoom", "zoomAndSettings", or "custom"
- `resetSizes.commands` - Array of VS Code command IDs to execute
- `resetSizes.settingsToReset` - Array of setting keys to remove

The following configuration properties remain **unchanged**:
- `resetSizes.scopes`
- `resetSizes.reloadAfter`
- `resetSizes.showSummaryNotification`

## Migration Steps

### If you used "zoomOnly" mode

**Old configuration (v0.x)**:
```json
{
  "resetSizes.mode": "zoomOnly"
}
```

**New configuration (v1.0.0)**:
```json
{
  "resetSizes.preset": "zoom"
}
```

This is the **default**, so you can simply remove the old setting and the extension will work the same way.

**Action**: Remove `resetSizes.mode` from your settings. The default preset is already "zoom".

---

### If you used "hardReset" mode

**Old configuration (v0.x)**:
```json
{
  "resetSizes.mode": "hardReset",
  "resetSizes.promptBeforeHardReset": true,
  "resetSizes.scopes": ["workspace"]
}
```

**New configuration (v1.0.0)**:
```json
{
  "resetSizes.preset": "zoomAndSettings",
  "resetSizes.promptBeforeReset": true,
  "resetSizes.scopes": ["workspace"]
}
```

**Action**:
1. Change `"resetSizes.mode": "hardReset"` to `"resetSizes.preset": "zoomAndSettings"`
2. Rename `"resetSizes.promptBeforeHardReset"` to `"resetSizes.promptBeforeReset"`
3. Remove `"resetSizes.includeWindowZoomPerWindow"` if you had it (no longer used)

---

### If you used "includeWindowZoomPerWindow"

**Old configuration (v0.x)**:
```json
{
  "resetSizes.mode": "hardReset",
  "resetSizes.includeWindowZoomPerWindow": true
}
```

**New configuration (v1.0.0)**:

The `includeWindowZoomPerWindow` setting has been removed. To achieve the same effect, use the custom preset:

```json
{
  "resetSizes.preset": "custom",
  "resetSizes.commands": [
    "workbench.action.zoomReset",
    "editor.action.fontZoomReset",
    "workbench.action.terminal.fontZoomReset"
  ],
  "resetSizes.settingsToReset": [
    "window.zoomLevel",
    "window.zoomPerWindow",
    "editor.fontSize",
    "editor.lineHeight",
    "terminal.integrated.fontSize",
    "terminal.integrated.lineHeight"
  ]
}
```

**Action**: Manually add `"window.zoomPerWindow"` to the `settingsToReset` array if you want it reset.

---

## Understanding the New System

### Presets

Presets are **shortcuts** that automatically populate the `commands` and `settingsToReset` arrays:

| Preset | Commands | Settings |
|--------|----------|----------|
| **zoom** | 3 zoom reset commands | None |
| **zoomAndSettings** | 3 zoom reset commands | 5 size-related settings |
| **custom** | Empty (you define) | Empty (you define) |

### Custom Configuration

The new system allows you to create fully custom reset profiles:

**Example: Only reset editor font size**
```json
{
  "resetSizes.preset": "custom",
  "resetSizes.commands": [],
  "resetSizes.settingsToReset": ["editor.fontSize"]
}
```

**Example: Reset zoom and increase editor font**
```json
{
  "resetSizes.preset": "custom",
  "resetSizes.commands": [
    "workbench.action.zoomReset",
    "editor.action.fontZoomIn"
  ],
  "resetSizes.settingsToReset": []
}
```

**Example: Add custom VS Code commands**
```json
{
  "resetSizes.preset": "custom",
  "resetSizes.commands": [
    "workbench.action.zoomReset",
    "workbench.action.toggleSidebarVisibility"
  ],
  "resetSizes.settingsToReset": ["editor.fontSize"]
}
```

You can add **any valid VS Code command** to the `commands` array!

---

## New Capabilities in v1.0.0

With the new configuration system, you can:

1. **Execute any VS Code command** - Not limited to zoom commands
2. **Choose exactly which settings to reset** - Full control over what gets removed
3. **Create custom reset profiles** - Define your own workflows
4. **Mix and match** - Combine any commands with any settings
5. **Empty command lists** - Only reset settings without executing commands
6. **Empty settings lists** - Only execute commands without resetting settings

---

## Quick Reference: Configuration Mapping

| Old Setting (v0.x) | New Setting (v1.0.0) |
|-------------------|---------------------|
| `resetSizes.mode` | `resetSizes.preset` |
| `"zoomOnly"` | `"zoom"` |
| `"hardReset"` | `"zoomAndSettings"` |
| `resetSizes.promptBeforeHardReset` | `resetSizes.promptBeforeReset` |
| `resetSizes.includeWindowZoomPerWindow` | Removed (manually add to settingsToReset) |

---

## Troubleshooting

### "My old settings don't work anymore"

This is expected! v1.0.0 breaks backward compatibility intentionally. Follow the migration steps above to update your configuration.

### "The extension doesn't reset settings anymore"

Check that:
1. Your preset is set to `"zoomAndSettings"` (not `"zoom"`)
2. OR you've manually configured `settingsToReset` array with `"custom"` preset

### "I want the old behavior back"

- **Old zoomOnly**: Use `"resetSizes.preset": "zoom"` (this is the default)
- **Old hardReset**: Use `"resetSizes.preset": "zoomAndSettings"`

The behavior is exactly the same, just with new names!

### "Can I still use keyboard shortcuts?"

Yes! Your keyboard shortcuts will continue to work. The command ID (`resetSizes.resetAll`) has not changed.

---

## Need Help?

If you encounter issues during migration:

1. Check the [README.md](README.md) for full configuration documentation
2. Check the Output channel (View > Output > "Reset Sizes") for detailed logs
3. Report issues on GitHub with your configuration settings

---

## Why This Change?

The v1.0.0 refactoring provides:

- **More flexibility** - Users can define exactly what they want to reset
- **Better extensibility** - Any VS Code command can be used, not just zoom commands
- **Clearer intent** - Configuration arrays explicitly show what will happen
- **Future-proof** - Easier to add new features without breaking changes

We believe this new system better serves power users while remaining simple for basic use cases.
