'use strict';

function normalizeName(value) {
  const name = value.trim();
  return /\.md$/i.test(name) ? name : `${name}.md`;
}

function validateName(value) {
  const raw = value.trim();
  if (!raw || raw === '.' || raw === '..') return 'Введите имя файла.';
  if (/[<>:"/\\|?*\u0000-\u001f\u007f]/.test(raw)) {
    return 'Укажите только имя файла, без пути и символов < > : " / \\ | ? *.';
  }
  if (/[. ]$/.test(raw)) return 'Имя не должно заканчиваться точкой.';
  const name = normalizeName(raw);
  if (/^\.md$/i.test(name)) return 'Введите имя перед расширением .md.';
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name)) {
    return 'Это имя зарезервировано системой. Выберите другое.';
  }
  if (name.length > 255) return 'Слишком длинное имя файла (максимум 255 символов).';
  return undefined;
}

function titleFromName(name) {
  return name.replace(/\.md$/i, '').replace(/[-_]+/g, ' ').replace(/[\r\n]/g, ' ');
}

function templateText(template, name) {
  const title = titleFromName(name);
  if (template === 'note') return `# ${title}\n\n`;
  if (template === 'readme') {
    return `# ${title}\n\n## Описание\n\nОписание проекта.\n\n## Установка\n\nИнструкция по установке.\n\n## Использование\n\nПримеры использования.\n\n`;
  }
  if (template === 'meeting') {
    return `# ${title}\n\n## Участники\n\n- \n\n## Повестка\n\n- \n\n## Решения\n\n- \n\n## Задачи\n\n- [ ] \n`;
  }
  return '';
}

function createController(vscode) {
  async function exists(uri) {
    try {
      await vscode.workspace.fs.stat(uri);
      return true;
    } catch (error) {
      if (error.code === 'FileNotFound') return false;
      throw error;
    }
  }

  async function destinationFolder(resource) {
    if (resource instanceof vscode.Uri) {
      const stat = await vscode.workspace.fs.stat(resource);
      return stat.type & vscode.FileType.Directory ? resource : vscode.Uri.joinPath(resource, '..');
    }
    const folders = vscode.workspace.workspaceFolders || [];
    if (!folders.length) return undefined;
    const activeUri = vscode.window.activeTextEditor?.document.uri;
    if (activeUri && vscode.workspace.getWorkspaceFolder(activeUri)) {
      return vscode.Uri.joinPath(activeUri, '..');
    }
    if (folders.length === 1) return folders[0].uri;
    const selected = await vscode.window.showWorkspaceFolderPick({ placeHolder: 'Выберите папку проекта' });
    return selected ? selected.uri : null;
  }

  async function create(resource, fromTemplate = false) {
    try {
      let template = 'empty';
      if (fromTemplate) {
        const selected = await vscode.window.showQuickPick([
          { label: 'Пустой файл', id: 'empty', description: 'Без начального содержимого' },
          { label: 'Заметка', id: 'note', description: 'Заголовок документа' },
          { label: 'README', id: 'readme', description: 'Описание, установка, использование' },
          { label: 'Встреча', id: 'meeting', description: 'Повестка, решения и задачи' }
        ], { placeHolder: 'Выберите шаблон Markdown' });
        if (!selected) return;
        template = selected.id;
      }

      const folder = await destinationFolder(resource);
      if (folder === null) return;
      let target;
      if (folder) {
        const name = await vscode.window.showInputBox({
          title: 'Создать Markdown-файл',
          prompt: 'Имя файла. Расширение .md добавится автоматически.',
          value: template === 'readme' ? 'README.md' : 'Новый документ.md',
          valueSelection: [0, template === 'readme' ? 6 : 14],
          ignoreFocusOut: true,
          validateInput: async value => {
            const invalid = validateName(value);
            if (invalid) return invalid;
            try {
              return await exists(vscode.Uri.joinPath(folder, normalizeName(value)))
                ? 'Файл с таким именем уже существует.' : undefined;
            } catch {
              return 'Не удалось проверить папку. Проверьте доступ к ней.';
            }
          }
        });
        if (name === undefined) return;
        const invalid = validateName(name);
        if (invalid) throw new Error(invalid);
        target = vscode.Uri.joinPath(folder, normalizeName(name));
      } else {
        target = await vscode.window.showSaveDialog({
          title: 'Создать Markdown-файл',
          saveLabel: 'Создать Markdown',
          filters: { Markdown: ['md'] }
        });
        if (!target) return;
        const basename = target.path.slice(target.path.lastIndexOf('/') + 1);
        const invalid = validateName(basename);
        if (invalid) throw new Error(invalid);
        target = vscode.Uri.joinPath(target, '..', normalizeName(basename));
      }

      if (await exists(target)) {
        await vscode.window.showErrorMessage('Файл уже существует. Выберите другое имя.');
        return;
      }
      const basename = target.path.slice(target.path.lastIndexOf('/') + 1);
      const edit = new vscode.WorkspaceEdit();
      // The create operation also rejects a collision that happens after stat().
      edit.createFile(target, { overwrite: false, ignoreIfExists: false });
      const content = templateText(template, basename);
      if (content) edit.insert(target, new vscode.Position(0, 0), content);
      if (!await vscode.workspace.applyEdit(edit)) {
        throw new Error('Не удалось создать файл. Проверьте имя и права доступа к папке.');
      }
      const document = await vscode.workspace.openTextDocument(target);
      await vscode.window.showTextDocument(document, { preview: false });
      if (document.isDirty && !await document.save()) {
        await vscode.window.showWarningMessage('Файл открыт, но содержимое не сохранено. Нажмите Ctrl+S для повторной попытки.');
      }
      return target;
    } catch (error) {
      await vscode.window.showErrorMessage(`Markdown: ${error.message || String(error)}`);
    }
  }

  return { create };
}

module.exports = { createController, normalizeName, validateName, templateText };
