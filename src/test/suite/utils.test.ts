import * as assert from 'assert';
import * as vscode from 'vscode';
import {
	executeVSCodeCommand,
	updateSetting,
	updateSettingAcrossScopes,
	getExtensionConfig,
	showConfirmationDialog,
	showReloadPrompt,
	PRESET_CONFIGS
} from '../../utils';

suite('Utility Functions Test Suite', () => {

	suite('getExtensionConfig', () => {
		test('should return default configuration values', () => {
			const config = getExtensionConfig();

			assert.ok(config, 'Config should be defined');
			assert.strictEqual(typeof config.preset, 'string');
			assert.ok(Array.isArray(config.commands));
			assert.ok(Array.isArray(config.settingsToReset));
			assert.ok(Array.isArray(config.scopes));
			assert.strictEqual(typeof config.promptBeforeReset, 'boolean');
			assert.strictEqual(typeof config.reloadAfter, 'string');
			assert.strictEqual(typeof config.showSummaryNotification, 'boolean');
		});

		test('should apply preset defaults when switching presets', async function() {
			if (!vscode.workspace.workspaceFolders) {
				this.skip();
				return;
			}

			const configApi = vscode.workspace.getConfiguration('resetSizes');

			// Store original values to restore later
			const originalPreset = configApi.get('preset');
			const originalCommands = configApi.inspect('commands');
			const originalSettings = configApi.inspect('settingsToReset');

			try {
				// Clear any explicit commands/settingsToReset to test preset defaults
				await configApi.update('commands', undefined, vscode.ConfigurationTarget.Workspace);
				await configApi.update('settingsToReset', undefined, vscode.ConfigurationTarget.Workspace);

				// Test 'zoom' preset
				await configApi.update('preset', 'zoom', vscode.ConfigurationTarget.Workspace);
				let config = getExtensionConfig();
				assert.deepStrictEqual(config.commands, PRESET_CONFIGS.zoom.commands,
					'zoom preset should have correct default commands');
				assert.deepStrictEqual(config.settingsToReset, PRESET_CONFIGS.zoom.settingsToReset,
					'zoom preset should have empty settingsToReset');

				// Test 'zoomAndSettings' preset
				await configApi.update('preset', 'zoomAndSettings', vscode.ConfigurationTarget.Workspace);
				config = getExtensionConfig();
				assert.deepStrictEqual(config.commands, PRESET_CONFIGS.zoomAndSettings.commands,
					'zoomAndSettings preset should have correct default commands');
				assert.deepStrictEqual(config.settingsToReset, PRESET_CONFIGS.zoomAndSettings.settingsToReset,
					'zoomAndSettings preset should have settings to reset, not empty array');
				assert.ok(config.settingsToReset.length > 0,
					'zoomAndSettings settingsToReset should not be empty');

				// Test 'custom' preset
				await configApi.update('preset', 'custom', vscode.ConfigurationTarget.Workspace);
				config = getExtensionConfig();
				assert.deepStrictEqual(config.commands, PRESET_CONFIGS.custom.commands,
					'custom preset should have empty default commands');
				assert.deepStrictEqual(config.settingsToReset, PRESET_CONFIGS.custom.settingsToReset,
					'custom preset should have empty settingsToReset');

			} finally {
				// Restore original values
				await configApi.update('preset', originalPreset, vscode.ConfigurationTarget.Workspace);
				if (originalCommands?.workspaceValue !== undefined) {
					await configApi.update('commands', originalCommands.workspaceValue, vscode.ConfigurationTarget.Workspace);
				} else {
					await configApi.update('commands', undefined, vscode.ConfigurationTarget.Workspace);
				}
				if (originalSettings?.workspaceValue !== undefined) {
					await configApi.update('settingsToReset', originalSettings.workspaceValue, vscode.ConfigurationTarget.Workspace);
				} else {
					await configApi.update('settingsToReset', undefined, vscode.ConfigurationTarget.Workspace);
				}
			}
		});
	});

	suite('executeVSCodeCommand', () => {
		test('should return success for valid commands', async () => {
			// Using a safe command that exists in VS Code and won't disrupt the test environment
			const result = await executeVSCodeCommand('workbench.action.showCommands');
			// This command should succeed
			assert.strictEqual(result.success, true);
			assert.strictEqual(result.error, undefined);
		});

		test('should return failure with error message for invalid commands', async () => {
			const result = await executeVSCodeCommand('invalid.command.that.does.not.exist');
			assert.strictEqual(result.success, false);
			assert.ok(result.error, 'Expected error message to be defined');
			assert.ok(result.error.length > 0, 'Expected non-empty error message');
		});
	});

	suite('updateSetting', () => {
		test('should successfully update a setting', async function() {
			// This test requires a workspace context
			if (!vscode.workspace.workspaceFolders) {
				this.skip();
				return;
			}

			const result = await updateSetting(
				'resetSizes.preset',
				'zoom',
				vscode.ConfigurationTarget.Workspace
			);

			assert.strictEqual(result.key, 'resetSizes.preset');
			assert.strictEqual(result.target, vscode.ConfigurationTarget.Workspace);
			assert.strictEqual(result.success, true, 'Setting update should succeed');
		});

		test('should handle setting reset with undefined value', async function() {
			if (!vscode.workspace.workspaceFolders) {
				this.skip();
				return;
			}

			const result = await updateSetting(
				'resetSizes.preset',
				undefined,
				vscode.ConfigurationTarget.Workspace
			);

			assert.strictEqual(result.key, 'resetSizes.preset');
			assert.strictEqual(result.success, true);
		});

		test('should update setting scoped to workspace folder', async function() {
			if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
				this.skip();
				return;
			}

			const folder = vscode.workspace.workspaceFolders[0];

			// Update setting at WorkspaceFolder scope with the folder provided
			const result = await updateSetting(
				'editor.tabSize',
				4,
				vscode.ConfigurationTarget.WorkspaceFolder,
				folder
			);

			assert.strictEqual(result.key, 'editor.tabSize');
			assert.strictEqual(result.target, vscode.ConfigurationTarget.WorkspaceFolder);
			assert.strictEqual(result.success, true, 'Setting update should succeed');

			// Clean up: reset the setting
			await updateSetting(
				'editor.tabSize',
				undefined,
				vscode.ConfigurationTarget.WorkspaceFolder,
				folder
			);
		});
	});

	suite('updateSettingAcrossScopes', () => {
		test('should update setting across multiple scopes', async function() {
			if (!vscode.workspace.workspaceFolders) {
				this.skip();
				return;
			}

			const { changes, warnings } = await updateSettingAcrossScopes(
				'editor.fontSize',
				['workspace'],
				vscode.workspace.workspaceFolders
			);

			assert.ok(Array.isArray(changes));
			assert.ok(changes.length >= 1, 'Should have at least one change');
			changes.forEach(result => {
				assert.strictEqual(result.key, 'editor.fontSize');
				assert.strictEqual(typeof result.success, 'boolean', 'success should be a boolean');
				assert.strictEqual(result.success, true, 'Setting update should succeed');
			});
			assert.ok(Array.isArray(warnings));
		});

		test('should handle no workspace', async () => {
			const { changes, warnings } = await updateSettingAcrossScopes(
				'editor.fontSize',
				['user'],
				undefined
			);

			assert.ok(Array.isArray(changes));
			assert.ok(Array.isArray(warnings));
		});

		test('should return warning when workspaceFolder scope has no folders', async () => {
			const { changes, warnings } = await updateSettingAcrossScopes(
				'editor.fontSize',
				['workspaceFolder'],
				undefined // No workspace folders
			);

			assert.ok(Array.isArray(changes));
			assert.strictEqual(changes.length, 0, 'No changes should be made without workspace folders');
			assert.ok(Array.isArray(warnings));
			assert.strictEqual(warnings.length, 1, 'Should have one warning');
			assert.ok(warnings[0].includes('workspaceFolder'), 'Warning should mention workspaceFolder scope');
			assert.ok(warnings[0].includes('editor.fontSize'), 'Warning should mention the setting key');
		});
	});

	suite('showConfirmationDialog', () => {
		test('should be a function', () => {
			assert.strictEqual(typeof showConfirmationDialog, 'function');
		});

		// Note: We cannot fully test UI interactions in automated tests
		// These would require manual testing or UI automation tools
	});

	suite('showReloadPrompt', () => {
		test('should be a function', () => {
			assert.strictEqual(typeof showReloadPrompt, 'function');
		});

		// Note: We cannot fully test UI interactions in automated tests
	});
});
