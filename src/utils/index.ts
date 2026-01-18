import * as vscode from 'vscode';
import { ExtensionConfig, ResetScope, SettingChange, Preset } from '../types';

/**
 * Preset configurations: predefined command and settings combinations.
 * Exported for testing purposes.
 */
export const PRESET_CONFIGS: Record<Preset, { commands: string[]; settingsToReset: string[] }> = {
	zoom: {
		commands: [
			'workbench.action.zoomReset',
			'editor.action.fontZoomReset',
			'workbench.action.terminal.fontZoomReset'
		],
		settingsToReset: []
	},
	zoomAndSettings: {
		commands: [
			'workbench.action.zoomReset',
			'editor.action.fontZoomReset',
			'workbench.action.terminal.fontZoomReset'
		],
		settingsToReset: [
			'window.zoomLevel',
			'editor.fontSize',
			'editor.lineHeight',
			'terminal.integrated.fontSize',
			'terminal.integrated.lineHeight'
		]
	},
	custom: {
		commands: [],
		settingsToReset: []
	}
};

/**
 * Execute a VS Code command and return whether it succeeded.
 * @param commandId The command ID to execute
 * @returns true if command executed successfully, false otherwise
 */
export async function executeVSCodeCommand(commandId: string): Promise<boolean> {
	try {
		await vscode.commands.executeCommand(commandId);
		return true;
	} catch (error) {
		// Command may not exist or may fail (e.g., terminal not open)
		return false;
	}
}

/**
 * Update a single setting in the specified configuration target.
 * @param key Setting key (e.g., 'editor.fontSize')
 * @param value New value, or undefined to reset to default
 * @param target Configuration target (Global, Workspace, WorkspaceFolder)
 * @param workspaceFolder Optional workspace folder for WorkspaceFolder target
 * @returns SettingChange result
 */
export async function updateSetting(
	key: string,
	value: unknown,
	target: vscode.ConfigurationTarget,
	workspaceFolder?: vscode.WorkspaceFolder
): Promise<SettingChange> {
	try {
		// When targeting WorkspaceFolder, scope configuration to that folder's URI
		const config = workspaceFolder
			? vscode.workspace.getConfiguration('', workspaceFolder.uri)
			: vscode.workspace.getConfiguration();
		await config.update(key, value, target);

		return {
			key,
			target,
			success: true
		};
	} catch (error) {
		return {
			key,
			target,
			success: false,
			error: error instanceof Error ? error.message : String(error)
		};
	}
}

/**
 * Update a setting across multiple configuration scopes.
 * @param key Setting key to update
 * @param scopes Scopes to apply the update to
 * @param workspaceFolders Available workspace folders
 * @returns Array of SettingChange results
 */
export async function updateSettingAcrossScopes(
	key: string,
	scopes: ResetScope[],
	workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined
): Promise<SettingChange[]> {
	const results: SettingChange[] = [];

	for (const scope of scopes) {
		switch (scope) {
			case 'user':
				results.push(await updateSetting(key, undefined, vscode.ConfigurationTarget.Global));
				break;

			case 'workspace':
				results.push(await updateSetting(key, undefined, vscode.ConfigurationTarget.Workspace));
				break;

			case 'workspaceFolder':
				if (workspaceFolders && workspaceFolders.length > 0) {
					// Apply to all workspace folders in multi-root workspace
					for (const folder of workspaceFolders) {
						results.push(await updateSetting(
							key,
							undefined,
							vscode.ConfigurationTarget.WorkspaceFolder,
							folder
						));
					}
				}
				break;
		}
	}

	return results;
}

/**
 * Read all extension configuration settings.
 * @returns ExtensionConfig object with all settings
 */
export function getExtensionConfig(): ExtensionConfig {
	const config = vscode.workspace.getConfiguration('resetSizes');

	const preset = config.get<Preset>('preset', 'zoom');
	const commands = config.get<string[]>('commands', PRESET_CONFIGS[preset].commands);
	const settingsToReset = config.get<string[]>('settingsToReset', PRESET_CONFIGS[preset].settingsToReset);

	return {
		preset,
		commands,
		settingsToReset,
		scopes: config.get<ResetScope[]>('scopes', ['workspace']),
		promptBeforeReset: config.get<boolean>('promptBeforeReset', true),
		reloadAfter: config.get<'never' | 'prompt' | 'always'>('reloadAfter', 'prompt'),
		showSummaryNotification: config.get<boolean>('showSummaryNotification', true)
	};
}

/**
 * Show a confirmation dialog with Proceed/Cancel buttons.
 * @param message Main message to display
 * @param detail Optional detailed description
 * @returns true if user clicked Proceed, false if canceled
 */
export async function showConfirmationDialog(message: string, detail?: string): Promise<boolean> {
	const result = await vscode.window.showWarningMessage(
		message,
		{ modal: true, detail },
		'Proceed',
		'Cancel'
	);

	return result === 'Proceed';
}

/**
 * Show a notification asking the user to reload the window.
 * If user clicks Reload, executes the reload command.
 */
export async function showReloadPrompt(): Promise<void> {
	const result = await vscode.window.showInformationMessage(
		'Reload window to apply changes?',
		'Reload',
		'Later'
	);

	if (result === 'Reload') {
		await vscode.commands.executeCommand('workbench.action.reloadWindow');
	}
}