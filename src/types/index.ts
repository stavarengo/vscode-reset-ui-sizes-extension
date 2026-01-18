import * as vscode from 'vscode';

/**
 * Preset configuration: quick shortcuts for common command/settings combinations.
 */
export type Preset = 'zoom' | 'zoomAndSettings' | 'custom';

/**
 * Configuration scope to apply settings reset.
 */
export type ResetScope = 'user' | 'workspace' | 'workspaceFolder';

/**
 * When to reload window after reset.
 */
export type ReloadAfterOption = 'never' | 'prompt' | 'always';

/**
 * Extension configuration interface.
 */
export interface ExtensionConfig {
	/** Preset configuration */
	preset: Preset;
	/** VS Code command IDs to execute */
	commands: string[];
	/** Setting keys to reset (remove custom values) */
	settingsToReset: string[];
	/** Configuration scopes to apply settings reset */
	scopes: ResetScope[];
	/** Show confirmation dialog before removing settings */
	promptBeforeReset: boolean;
	/** When to reload window after reset */
	reloadAfter: ReloadAfterOption;
	/** Show notification with summary of reset actions */
	showSummaryNotification: boolean;
}

/**
 * Result of a setting change operation.
 */
export interface SettingChange {
	/** Setting key (e.g., 'editor.fontSize') */
	key: string;
	/** Configuration target where the setting was changed */
	target: vscode.ConfigurationTarget;
	/** Whether the change was successful */
	success: boolean;
	/** Error message if the change failed */
	error?: string;
}

/**
 * Result of the resetAllSizes command.
 */
export interface ResetAllSizesResult {
	/** List of VS Code commands that were executed successfully */
	executedCommands: string[];
	/** List of VS Code commands that failed to execute */
	failedCommands: Array<{ id: string; error: string }>;
	/** List of settings that were updated */
	updatedSettings: SettingChange[];
	/** Timestamp of when the reset was performed */
	timestamp: Date;
}

/**
 * Result of updating settings across scopes.
 */
export interface UpdateSettingsResult {
	/** List of setting changes */
	changes: SettingChange[];
	/** Warning messages (e.g., workspaceFolder scope with no folders) */
	warnings: string[];
}