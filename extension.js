'use strict';

const vscode = require('vscode');
const { createController } = require('./src/create-markdown');

function activate(context) {
  const controller = createController(vscode);
  context.subscriptions.push(
    vscode.commands.registerCommand('markdownCreator.newFile', async () => {
      try {
        const document = await vscode.workspace.openTextDocument({ language: 'markdown', content: '' });
        return await vscode.window.showTextDocument(document, { preview: false });
      } catch (error) {
        await vscode.window.showErrorMessage(`Markdown: ${error.message || String(error)}`);
      }
    }),
    vscode.commands.registerCommand('markdownCreator.create', uri => controller.create(uri)),
    vscode.commands.registerCommand('markdownCreator.createFromTemplate', uri => controller.create(uri, true))
  );
}

module.exports = { activate };
