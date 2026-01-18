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
		test('should return true for valid commands', async () => {
			// Using a safe command that exists in VS Code and won't disrupt the test environment
			const result = await executeVSCodeCommand('workbench.action.showCommands');
			// This command should succeed and return true
			assert.strictEqual(result, true);
		});

		test('should return false for invalid commands', async () => {
			const result = await executeVSCodeCommand('invalid.command.that.does.not.exist');
			assert.strictEqual(result, false);
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
			assert.ok(result.success !== undefined);
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
	});

	suite('updateSettingAcrossScopes', () => {
		test('should update setting across multiple scopes', async function() {
			if (!vscode.workspace.workspaceFolders) {
				this.skip();
				return;
			}

			const results = await updateSettingAcrossScopes(
				'editor.fontSize',
				['workspace'],
				vscode.workspace.workspaceFolders
			);

			assert.ok(Array.isArray(results));
			assert.ok(results.length >= 1);
			results.forEach(result => {
				assert.strictEqual(result.key, 'editor.fontSize');
				assert.ok(result.success !== undefined);
			});
		});

		test('should handle no workspace', async () => {
			const results = await updateSettingAcrossScopes(
				'editor.fontSize',
				['user'],
				undefined
			);

			assert.ok(Array.isArray(results));
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
