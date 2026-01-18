import * as vscode from 'vscode';
import { resetAllSizes } from './commands/resetAllSizes';

let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
	// Create output channel for logging
	outputChannel = vscode.window.createOutputChannel('Reset Sizes');
	context.subscriptions.push(outputChannel);

	// Register the resetSizes.resetAll command
	const disposable = vscode.commands.registerCommand('resetSizes.resetAll', async () => {
		try {
			outputChannel.show(true); // Show output channel (preserving focus)
			await resetAllSizes(outputChannel);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			outputChannel.appendLine(`Error: ${errorMessage}`);
			vscode.window.showErrorMessage(`Reset All Sizes failed: ${errorMessage}`);
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {
	// Dispose output channel
	if (outputChannel) {
		outputChannel.dispose();
	}
}