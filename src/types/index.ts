import * as vscode from 'vscode';

/**
 * Reset mode: 'zoomOnly' resets zoom behaviors only,
 * 'hardReset' also removes size-related settings overrides.
 */
export type ResetMode = 'zoomOnly' | 'hardReset';

/**
 * Configuration scope to apply hard reset.
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
	/** Reset mode */
	mode: ResetMode;
	/** Configuration scopes to apply hard reset (only used in hardReset mode) */
	scopes: ResetScope[];
	/** Whether to reset window.zoomPerWindow setting in hard reset mode */
	includeWindowZoomPerWindow: boolean;
	/** Show confirmation dialog before applying hard reset */
	promptBeforeHardReset: boolean;
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
	/** The reset mode that was used */
	mode: ResetMode;
	/** Timestamp of when the reset was performed */
	timestamp: Date;
}