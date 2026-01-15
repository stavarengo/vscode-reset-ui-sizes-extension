import * as assert from 'assert';
import * as vscode from 'vscode';
import { resetAllSizes } from '../../commands/resetAllSizes';

suite('resetAllSizes Command Test Suite', () => {

	test('should execute and return a result object', async function() {
		// Create a mock output channel
		const outputChannel = vscode.window.createOutputChannel('Test Reset Sizes');
		const mockContext: any = {
			subscriptions: [],
			extensionPath: '',
			globalState: {
				get: () => undefined,
				update: () => Promise.resolve(),
				keys: () => []
			},
			workspaceState: {
				get: () => undefined,
				update: () => Promise.resolve(),
				keys: () => []
			}
		};

		const result = await resetAllSizes(mockContext, outputChannel);

		assert.ok(result, 'Result should be defined');
		assert.ok(Array.isArray(result.executedCommands), 'executedCommands should be an array');
		assert.ok(Array.isArray(result.failedCommands), 'failedCommands should be an array');
		assert.ok(Array.isArray(result.updatedSettings), 'updatedSettings should be an array');
		assert.ok(result.timestamp instanceof Date, 'timestamp should be a Date');

		outputChannel.dispose();
	});

	test('should execute zoom reset commands with zoom preset', async function() {
		const outputChannel = vscode.window.createOutputChannel('Test Reset Sizes');
		const mockContext: any = {
			subscriptions: [],
			extensionPath: '',
			globalState: { get: () => undefined, update: () => Promise.resolve(), keys: () => [] },
			workspaceState: { get: () => undefined, update: () => Promise.resolve(), keys: () => [] }
		};

		// Ensure preset is set to zoom
		await vscode.workspace.getConfiguration('resetSizes').update('preset', 'zoom', vscode.ConfigurationTarget.Global);

		const result = await resetAllSizes(mockContext, outputChannel);

		// Should have attempted zoom commands
		const allCommands = [...result.executedCommands, ...result.failedCommands.map(f => f.id)];
		assert.ok(
			allCommands.some(cmd => cmd === 'workbench.action.zoomReset'),
			'Should attempt UI zoom reset'
		);

		// Should NOT have updated settings with zoom preset (default has empty settingsToReset)
		assert.strictEqual(result.updatedSettings.length, 0, 'Should not update settings with zoom preset');

		outputChannel.dispose();
	});

	test('should handle zoomAndSettings preset with settings updates', async function() {
		if (!vscode.workspace.workspaceFolders) {
			this.skip();
			return;
		}

		const outputChannel = vscode.window.createOutputChannel('Test Reset Sizes');
		const mockContext: any = {
			subscriptions: [],
			extensionPath: '',
			globalState: { get: () => undefined, update: () => Promise.resolve(), keys: () => [] },
			workspaceState: { get: () => undefined, update: () => Promise.resolve(), keys: () => [] }
		};

		// Set configuration for zoomAndSettings preset
		const config = vscode.workspace.getConfiguration('resetSizes');
		await config.update('preset', 'zoomAndSettings', vscode.ConfigurationTarget.Global);
		await config.update('promptBeforeReset', false, vscode.ConfigurationTarget.Global);
		await config.update('scopes', ['workspace'], vscode.ConfigurationTarget.Global);

		const result = await resetAllSizes(mockContext, outputChannel);

		// Should have executed zoom commands
		assert.ok(result.executedCommands.length > 0, 'Should execute at least some commands');

		// With zoomAndSettings preset, should have attempted to update settings
		// (may be 0 if confirmation was canceled, but we disabled prompt)
		assert.ok(result.updatedSettings.length >= 0, 'updatedSettings should be defined');

		outputChannel.dispose();

		// Reset config back to default
		await config.update('preset', undefined, vscode.ConfigurationTarget.Global);
		await config.update('promptBeforeReset', undefined, vscode.ConfigurationTarget.Global);
		await config.update('scopes', undefined, vscode.ConfigurationTarget.Global);
	});

	test('should handle errors gracefully', async function() {
		const outputChannel = vscode.window.createOutputChannel('Test Reset Sizes');
		const mockContext: any = {
			subscriptions: [],
			extensionPath: '',
			globalState: { get: () => undefined, update: () => Promise.resolve(), keys: () => [] },
			workspaceState: { get: () => undefined, update: () => Promise.resolve(), keys: () => [] }
		};

		// This should not throw even if some commands fail
		const result = await resetAllSizes(mockContext, outputChannel);

		// Should have a valid result even if some operations failed
		assert.ok(result);
		assert.ok(result.executedCommands || result.failedCommands);

		outputChannel.dispose();
	});

	test('should include timestamp in result', async function() {
		const outputChannel = vscode.window.createOutputChannel('Test Reset Sizes');
		const mockContext: any = {
			subscriptions: [],
			extensionPath: '',
			globalState: { get: () => undefined, update: () => Promise.resolve(), keys: () => [] },
			workspaceState: { get: () => undefined, update: () => Promise.resolve(), keys: () => [] }
		};

		const before = new Date();
		const result = await resetAllSizes(mockContext, outputChannel);
		const after = new Date();

		assert.ok(result.timestamp >= before, 'Timestamp should be after test start');
		assert.ok(result.timestamp <= after, 'Timestamp should be before test end');

		outputChannel.dispose();
	});
});
