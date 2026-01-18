import * as vscode from 'vscode';
import { ResetAllSizesResult } from '../types';
import {
	getExtensionConfig,
	executeVSCodeCommand,
	updateSettingAcrossScopes,
	showConfirmationDialog,
	showReloadPrompt
} from '../utils';

/**
 * Main command to reset all UI sizes.
 * @param outputChannel Output channel for logging
 * @returns Result object with details of what was reset
 */
export async function resetAllSizes(
	outputChannel: vscode.OutputChannel
): Promise<ResetAllSizesResult> {
	// Step 1: Read extension configuration
	const config = getExtensionConfig();
	outputChannel.appendLine('Starting Reset All Sizes...');
	outputChannel.appendLine(`Preset: ${config.preset}`);
	outputChannel.appendLine(`Commands: ${config.commands.length}, Settings: ${config.settingsToReset.length}`);

	// Step 2: Initialize result object
	const result: ResetAllSizesResult = {
		executedCommands: [],
		failedCommands: [],
		updatedSettings: [],
		timestamp: new Date()
	};

	// Step 3: Execute configured commands
	if (config.commands.length === 0) {
		outputChannel.appendLine('No commands configured to execute');
	} else {
		outputChannel.appendLine(`Executing ${config.commands.length} commands...`);
		for (const commandId of config.commands) {
			outputChannel.appendLine(`Executing: ${commandId}`);
			const commandResult = await executeVSCodeCommand(commandId);

			if (commandResult.success) {
				result.executedCommands.push(commandId);
				outputChannel.appendLine(`✓ ${commandId} succeeded`);
			} else {
				const errorMessage = commandResult.error || 'Unknown error';
				result.failedCommands.push({
					id: commandId,
					error: errorMessage
				});
				outputChannel.appendLine(`✗ ${commandId} failed: ${errorMessage}`);
			}
		}
	}

	// Step 4: Reset configured settings
	if (config.settingsToReset.length === 0) {
		outputChannel.appendLine('No settings configured to reset');
	} else {
		outputChannel.appendLine(`Resetting ${config.settingsToReset.length} settings...`);

		// Prompt before resetting (if configured)
		let proceedWithReset = true;
		if (config.promptBeforeReset) {
			outputChannel.appendLine('Prompting user for confirmation...');
			proceedWithReset = await showConfirmationDialog(
				'Reset Settings: Remove custom overrides?',
				`This will remove your custom values for ${config.settingsToReset.length} settings (${config.settingsToReset.join(', ')}) from the selected configuration scopes. VS Code defaults will be restored.`
			);
		}

		if (proceedWithReset) {
			outputChannel.appendLine('Proceeding with settings reset...');

			for (const setting of config.settingsToReset) {
				outputChannel.appendLine(`Resetting ${setting}...`);
				const { changes, warnings } = await updateSettingAcrossScopes(
					setting,
					config.scopes,
					vscode.workspace.workspaceFolders
				);
				result.updatedSettings.push(...changes);

				// Log any warnings (e.g., workspaceFolder scope with no folders)
				for (const warning of warnings) {
					outputChannel.appendLine(`⚠ Warning: ${warning}`);
				}

				const successCount = changes.filter(c => c.success).length;
				const failCount = changes.length - successCount;
				outputChannel.appendLine(`  ✓ ${successCount} succeeded, ${failCount} failed`);
			}
		} else {
			outputChannel.appendLine('Settings reset canceled by user');
		}
	}

	// Step 5: Show summary notification
	if (config.showSummaryNotification) {
		const commandCount = result.executedCommands.length;
		const settingCount = result.updatedSettings.filter(s => s.success).length;
		const message = settingCount > 0
			? `Executed ${commandCount} commands, reset ${settingCount} settings.`
			: `Executed ${commandCount} commands.`;

		vscode.window.showInformationMessage(message);
		outputChannel.appendLine(`Summary: ${message}`);
	}

	// Step 6: Handle reload prompt
	const settingsChanged = result.updatedSettings.some(s => s.success);
	if (config.reloadAfter === 'always') {
		outputChannel.appendLine('Auto-reloading window...');
		await vscode.commands.executeCommand('workbench.action.reloadWindow');
	} else if (config.reloadAfter === 'prompt' && settingsChanged) {
		outputChannel.appendLine('Prompting user to reload...');
		await showReloadPrompt();
	}

	outputChannel.appendLine('Reset All Sizes completed');
	outputChannel.appendLine(`Executed: ${result.executedCommands.length}, Failed: ${result.failedCommands.length}, Settings: ${result.updatedSettings.length}`);

	return result;
}
