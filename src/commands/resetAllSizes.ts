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
 * @param context Extension context
 * @param outputChannel Output channel for logging
 * @returns Result object with details of what was reset
 */
export async function resetAllSizes(
	context: vscode.ExtensionContext,
	outputChannel: vscode.OutputChannel
): Promise<ResetAllSizesResult> {
	// Step 1: Read extension configuration
	const config = getExtensionConfig();
	outputChannel.appendLine('Starting Reset All Sizes...');
	outputChannel.appendLine(`Mode: ${config.mode}`);

	// Step 2: Initialize result object
	const result: ResetAllSizesResult = {
		executedCommands: [],
		failedCommands: [],
		updatedSettings: [],
		mode: config.mode,
		timestamp: new Date()
	};

	// Step 3: Reset UI zoom
	outputChannel.appendLine('Resetting UI zoom...');
	const uiZoomSuccess = await executeVSCodeCommand('workbench.action.zoomReset');
	if (uiZoomSuccess) {
		result.executedCommands.push('workbench.action.zoomReset');
		outputChannel.appendLine('✓ UI zoom reset');
	} else {
		result.failedCommands.push({
			id: 'workbench.action.zoomReset',
			error: 'Command execution failed'
		});
		outputChannel.appendLine('✗ UI zoom reset failed');
	}

	// Step 4: Reset editor font zoom
	outputChannel.appendLine('Resetting editor font zoom...');
	const editorZoomSuccess = await executeVSCodeCommand('editor.action.fontZoomReset');
	if (editorZoomSuccess) {
		result.executedCommands.push('editor.action.fontZoomReset');
		outputChannel.appendLine('✓ Editor font zoom reset');
	} else {
		result.failedCommands.push({
			id: 'editor.action.fontZoomReset',
			error: 'Command execution failed'
		});
		outputChannel.appendLine('✗ Editor font zoom reset failed');
	}

	// Step 5: Reset terminal font zoom
	outputChannel.appendLine('Resetting terminal font zoom...');
	const terminalZoomSuccess = await executeVSCodeCommand('workbench.action.terminal.fontZoomReset');
	if (terminalZoomSuccess) {
		result.executedCommands.push('workbench.action.terminal.fontZoomReset');
		outputChannel.appendLine('✓ Terminal font zoom reset');
	} else {
		result.failedCommands.push({
			id: 'workbench.action.terminal.fontZoomReset',
			error: 'Command execution failed (terminal may not be open)'
		});
		outputChannel.appendLine('✓ Terminal font zoom reset (or no terminal)');
	}

	// Step 6: Hard reset settings (if mode is hardReset)
	if (config.mode === 'hardReset') {
		outputChannel.appendLine('Hard reset mode enabled...');

		// Step 6a: Show confirmation dialog if configured
		let proceedWithHardReset = true;
		if (config.promptBeforeHardReset) {
			outputChannel.appendLine('Prompting user for confirmation...');
			proceedWithHardReset = await showConfirmationDialog(
				'Hard Reset: Remove size-related settings?',
				'This will remove overrides for window zoom, editor font size, terminal font size, and related settings from the selected configuration scopes.'
			);
		}

		if (proceedWithHardReset) {
			outputChannel.appendLine('Proceeding with hard reset...');

			// Define size settings to reset
			const sizeSettings = [
				'window.zoomLevel',
				'editor.fontSize',
				'editor.lineHeight',
				'terminal.integrated.fontSize',
				'terminal.integrated.lineHeight'
			];

			// Conditionally include window.zoomPerWindow
			if (config.includeWindowZoomPerWindow) {
				sizeSettings.push('window.zoomPerWindow');
			}

			// Reset each setting across configured scopes
			for (const setting of sizeSettings) {
				outputChannel.appendLine(`Resetting ${setting}...`);
				const changes = await updateSettingAcrossScopes(
					setting,
					config.scopes,
					vscode.workspace.workspaceFolders
				);
				result.updatedSettings.push(...changes);

				const successCount = changes.filter(c => c.success).length;
				const failCount = changes.length - successCount;
				outputChannel.appendLine(`  ✓ ${successCount} succeeded, ${failCount} failed`);
			}
		} else {
			outputChannel.appendLine('Hard reset canceled by user');
		}
	}

	// Step 7: Show summary notification
	if (config.showSummaryNotification) {
		const message = config.mode === 'zoomOnly'
			? `Reset UI zoom, editor font zoom, and terminal font zoom.`
			: `Reset zooms and ${result.updatedSettings.filter(s => s.success).length} settings.`;

		vscode.window.showInformationMessage(message);
		outputChannel.appendLine(`Summary: ${message}`);
	}

	// Step 8: Handle reload prompt
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
