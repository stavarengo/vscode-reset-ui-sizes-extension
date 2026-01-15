import * as assert from 'assert';
import * as vscode from 'vscode';
import {
	ResetMode,
	ResetScope,
	ReloadAfterOption,
	ExtensionConfig,
	SettingChange,
	ResetAllSizesResult
} from '../../types';

suite('Type Definitions Test Suite', () => {
	test('ResetMode type should accept valid values', () => {
		const zoomOnly: ResetMode = 'zoomOnly';
		const hardReset: ResetMode = 'hardReset';
		assert.strictEqual(zoomOnly, 'zoomOnly');
		assert.strictEqual(hardReset, 'hardReset');
	});

	test('ResetScope type should accept valid values', () => {
		const user: ResetScope = 'user';
		const workspace: ResetScope = 'workspace';
		const workspaceFolder: ResetScope = 'workspaceFolder';
		assert.strictEqual(user, 'user');
		assert.strictEqual(workspace, 'workspace');
		assert.strictEqual(workspaceFolder, 'workspaceFolder');
	});

	test('ReloadAfterOption type should accept valid values', () => {
		const never: ReloadAfterOption = 'never';
		const prompt: ReloadAfterOption = 'prompt';
		const always: ReloadAfterOption = 'always';
		assert.strictEqual(never, 'never');
		assert.strictEqual(prompt, 'prompt');
		assert.strictEqual(always, 'always');
	});

	test('ExtensionConfig should have all required properties', () => {
		const config: ExtensionConfig = {
			mode: 'zoomOnly',
			scopes: ['workspace'],
			includeWindowZoomPerWindow: false,
			promptBeforeHardReset: true,
			reloadAfter: 'prompt',
			showSummaryNotification: true
		};

		assert.strictEqual(config.mode, 'zoomOnly');
		assert.deepStrictEqual(config.scopes, ['workspace']);
		assert.strictEqual(config.includeWindowZoomPerWindow, false);
		assert.strictEqual(config.promptBeforeHardReset, true);
		assert.strictEqual(config.reloadAfter, 'prompt');
		assert.strictEqual(config.showSummaryNotification, true);
	});

	test('SettingChange should track setting update result', () => {
		const successChange: SettingChange = {
			key: 'editor.fontSize',
			target: vscode.ConfigurationTarget.Workspace,
			success: true
		};

		assert.strictEqual(successChange.key, 'editor.fontSize');
		assert.strictEqual(successChange.target, vscode.ConfigurationTarget.Workspace);
		assert.strictEqual(successChange.success, true);
		assert.strictEqual(successChange.error, undefined);

		const failedChange: SettingChange = {
			key: 'terminal.integrated.fontSize',
			target: vscode.ConfigurationTarget.Global,
			success: false,
			error: 'Permission denied'
		};

		assert.strictEqual(failedChange.success, false);
		assert.strictEqual(failedChange.error, 'Permission denied');
	});

	test('ResetAllSizesResult should have all required properties', () => {
		const result: ResetAllSizesResult = {
			executedCommands: ['workbench.action.zoomReset', 'editor.action.fontZoomReset'],
			failedCommands: [{ id: 'workbench.action.terminal.fontZoomReset', error: 'No terminal' }],
			updatedSettings: [
				{
					key: 'editor.fontSize',
					target: vscode.ConfigurationTarget.Workspace,
					success: true
				}
			],
			mode: 'hardReset',
			timestamp: new Date()
		};

		assert.strictEqual(result.executedCommands.length, 2);
		assert.strictEqual(result.failedCommands.length, 1);
		assert.strictEqual(result.failedCommands[0].id, 'workbench.action.terminal.fontZoomReset');
		assert.strictEqual(result.updatedSettings.length, 1);
		assert.strictEqual(result.mode, 'hardReset');
		assert.ok(result.timestamp instanceof Date);
	});
});
