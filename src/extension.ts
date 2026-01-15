import * as vscode from 'vscode';
import { resetAllSizes } from './commands/resetAllSizes';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.resetAllSizes', () => {
        resetAllSizes();
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}