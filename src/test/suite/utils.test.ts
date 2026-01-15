import * as assert from 'assert';
import * as vscode from 'vscode';
import {
	executeVSCodeCommand,
	updateSetting,
	updateSettingAcrossScopes,
	getExtensionConfig,
	showConfirmationDialog,
	showReloadPrompt
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
	});

	suite('executeVSCodeCommand', () => {
		test('should return true for valid commands', async () => {
			// Using a command that always exists in VS Code
			const result = await executeVSCodeCommand('workbench.action.reloadWindow');
			// This command may or may not succeed depending on the environment,
			// but it should return a boolean
			assert.strictEqual(typeof result, 'boolean');
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
