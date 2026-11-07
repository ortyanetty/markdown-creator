'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const vscode = require('vscode');
const { createController } = require('../../src/create-markdown');
const manifest = require('../../package.json');

async function run() {
  const report = [];
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'markdown-creator-test-'));
  const folder = vscode.Uri.file(temp);
  async function check(name, callback) {
    await callback();
    report.push(`PASS ${name}`);
    console.log(report[report.length - 1]);
  }
  const errors = [];
  const answers = { name: 'заметки', template: 'note', save: undefined };
  const api = {
    Uri: vscode.Uri, FileType: vscode.FileType, Position: vscode.Position,
    WorkspaceEdit: vscode.WorkspaceEdit,
    workspace: {
      fs: vscode.workspace.fs,
      applyEdit: vscode.workspace.applyEdit,
      openTextDocument: vscode.workspace.openTextDocument,
      getWorkspaceFolder: () => undefined,
      workspaceFolders: [{ uri: folder, name: 'test', index: 0 }]
    },
    window: {
      activeTextEditor: undefined,
      showInputBox: async options => {
        if (answers.name !== undefined) {
          const issue = await options.validateInput(answers.name);
          if (issue) { errors.push(issue); return undefined; }
        }
        return answers.name;
      },
      showQuickPick: async () => answers.template ? { id: answers.template } : undefined,
      showSaveDialog: async () => answers.save,
      showWorkspaceFolderPick: async () => undefined,
      showErrorMessage: async message => errors.push(message),
      showWarningMessage: async message => errors.push(message),
      showTextDocument: vscode.window.showTextDocument
    }
  };
  const controller = createController(api);
  try {
    await check('extension activates and registers the New File command', async () => {
      const extension = vscode.extensions.getExtension(`${manifest.publisher}.${manifest.name}`);
      assert.ok(extension);
      await extension.activate();
      assert.ok((await vscode.commands.getCommands(true)).includes('markdownCreator.newFile'));
      assert.equal(extension.packageJSON.contributes.menus['file/newFile'][0].command, 'markdownCreator.newFile');
    });
    await check('New File command opens an empty untitled Markdown editor', async () => {
      await vscode.commands.executeCommand('markdownCreator.newFile');
      const document = vscode.window.activeTextEditor.document;
      assert.equal(document.isUntitled, true);
      assert.equal(document.languageId, 'markdown');
      assert.equal(document.getText(), '');
    });
    await check('each invocation opens a separate Markdown document', async () => {
      const first = vscode.window.activeTextEditor.document.uri.toString();
      await vscode.commands.executeCommand('markdownCreator.newFile');
      assert.notEqual(vscode.window.activeTextEditor.document.uri.toString(), first);
      assert.equal(vscode.window.activeTextEditor.document.languageId, 'markdown');
    });
    await check('creates an empty .md file on disk with Cyrillic name', async () => {
      const uri = await controller.create(folder);
      assert.ok(uri);
      assert.equal(await fs.readFile(uri.fsPath, 'utf8'), '');
      assert.equal(vscode.window.activeTextEditor.document.languageId, 'markdown');
    });
    await check('does not overwrite an existing file', async () => {
      await fs.writeFile(path.join(temp, 'заметки.md'), 'KEEP');
      assert.equal(await controller.create(folder), undefined);
      assert.equal(await fs.readFile(path.join(temp, 'заметки.md'), 'utf8'), 'KEEP');
      assert.match(errors.pop(), /уже существует/);
    });
    await check('creates and saves template next to a selected file', async () => {
      answers.name = 'встреча.MD';
      answers.template = 'meeting';
      const uri = await controller.create(vscode.Uri.joinPath(folder, 'заметки.md'), true);
      assert.ok(uri);
      assert.match(await fs.readFile(uri.fsPath, 'utf8'), /# встреча\r?\n/);
      assert.equal(vscode.window.activeTextEditor.document.isDirty, false);
    });
    await check('input and template cancellation create no files', async () => {
      const before = await fs.readdir(temp);
      answers.name = undefined;
      assert.equal(await controller.create(folder), undefined);
      answers.template = undefined;
      assert.equal(await controller.create(folder, true), undefined);
      assert.deepEqual(await fs.readdir(temp), before);
    });
    await check('works without a workspace and appends .md in save dialog flow', async () => {
      api.workspace.workspaceFolders = [];
      answers.save = vscode.Uri.joinPath(folder, 'standalone');
      const uri = await controller.create();
      assert.equal(uri.fsPath, vscode.Uri.joinPath(folder, 'standalone.md').fsPath);
      assert.equal(await fs.readFile(uri.fsPath, 'utf8'), '');
    });
    await check('cancelling a multi-root folder picker creates no file', async () => {
      api.workspace.workspaceFolders = [{ uri: folder }, { uri: vscode.Uri.joinPath(folder, 'other') }];
      assert.equal(await controller.create(), undefined);
    });
    await check('failed creation is reported to the user', async () => {
      answers.name = 'failure';
      api.workspace.applyEdit = async () => false;
      assert.equal(await controller.create(folder), undefined);
      assert.match(errors.pop(), /Не удалось создать файл/);
      assert.equal(await fs.stat(path.join(temp, 'failure.md')).catch(() => null), null);
    });
    await check('file appearing between validation and creation is not overwritten', async () => {
      answers.name = 'collision';
      api.workspace.applyEdit = async edit => {
        await fs.writeFile(path.join(temp, 'collision.md'), 'CREATED ELSEWHERE');
        return vscode.workspace.applyEdit(edit);
      };
      assert.equal(await controller.create(folder), undefined);
      assert.equal(await fs.readFile(path.join(temp, 'collision.md'), 'utf8'), 'CREATED ELSEWHERE');
      assert.match(errors.pop(), /Markdown:/);
    });
    assert.deepEqual(errors, []);
  } finally {
    if (process.env.MARKDOWN_CREATOR_TEST_REPORT) {
      await fs.writeFile(process.env.MARKDOWN_CREATOR_TEST_REPORT, report.join('\n') + '\n');
    }
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    await fs.rm(temp, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }).catch(error => {
      console.warn(`Temporary test folder cleanup: ${error.message}`);
    });
  }
}

module.exports = { run };
