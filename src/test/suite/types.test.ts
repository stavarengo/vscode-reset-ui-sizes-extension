import * as assert from 'assert';
import * as vscode from 'vscode';
import {
	Preset,
	ResetScope,
	ReloadAfterOption,
	ExtensionConfig,
	SettingChange,
	ResetAllSizesResult
} from '../../types';

suite('Type Definitions Test Suite', () => {
	test('Preset type should accept valid values', () => {
		const zoom: Preset = 'zoom';
		const zoomAndSettings: Preset = 'zoomAndSettings';
		const custom: Preset = 'custom';
		assert.strictEqual(zoom, 'zoom');
		assert.strictEqual(zoomAndSettings, 'zoomAndSettings');
		assert.strictEqual(custom, 'custom');
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
			preset: 'zoom',
			commands: ['workbench.action.zoomReset', 'editor.action.fontZoomReset'],
			settingsToReset: [],
			scopes: ['workspace'],
			promptBeforeReset: true,
			reloadAfter: 'prompt',
			showSummaryNotification: true
		};

		assert.strictEqual(config.preset, 'zoom');
		assert.deepStrictEqual(config.commands, ['workbench.action.zoomReset', 'editor.action.fontZoomReset']);
		assert.deepStrictEqual(config.settingsToReset, []);
		assert.deepStrictEqual(config.scopes, ['workspace']);
		assert.strictEqual(config.promptBeforeReset, true);
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
			timestamp: new Date()
		};

		assert.strictEqual(result.executedCommands.length, 2);
		assert.strictEqual(result.failedCommands.length, 1);
		assert.strictEqual(result.failedCommands[0].id, 'workbench.action.terminal.fontZoomReset');
		assert.strictEqual(result.updatedSettings.length, 1);
		assert.ok(result.timestamp instanceof Date);
	});
});
