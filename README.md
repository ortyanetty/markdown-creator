# Markdown Creator

Create Markdown files directly from VS Code's **New File…** menu. Markdown Creator adds a **Markdown File** option alongside other file types, so you can open a blank Markdown document and start writing right away.

You can also create `.md` files in your project from the Explorer or Command Palette, with optional templates for notes, README files, and meeting notes.

## Features

- **Markdown in New File…** — open an untitled document with Markdown syntax highlighting and access to VS Code's built-in preview.
- **Create files in your project** — use the Explorer context menu, Explorer toolbar, or Command Palette.
- **Automatic `.md` extension** — enter a filename and let the extension add `.md` when creating a file in a folder.
- **Optional templates** — choose a blank file, a note, a README, or meeting notes with a task checklist.
- **Existing file protection** — existing files are never overwritten.
- **Flexible workspace support** — create files with a single folder, multiple workspace folders, or no project open.

The extension runs without external runtime dependencies, network requests, or telemetry.

## Getting started

### From the New File menu

1. Select **File → New File…**, or **New File…** on the Welcome page.
2. Choose **Markdown File**. Start typing `Markdown` to find it quickly.
3. Write your content in the new Markdown document.
4. Press `Ctrl+S` (`Cmd+S` on macOS), choose a folder, and save the document as a `.md` file, such as `notes.md`.

The document remains untitled until you save it. The standard `Ctrl+N` shortcut continues to create a plain text document.

### Directly in a project folder

Right-click a folder in the Explorer and select **Создать Markdown-файл (.md)**, or use the matching new-file button in the Explorer toolbar. You can also open the Command Palette and run **Markdown: Создать Markdown-файл (.md)**.

Enter a filename such as `notes`. The extension creates `notes.md` and opens it for editing. If the name already ends in `.md`, the extension keeps it as entered.

From the context menu, the new file is created in the selected folder or next to the selected file. From the Command Palette or toolbar, the extension uses the active file's folder when it belongs to the workspace. Otherwise, it uses the workspace root or asks you to choose a workspace folder. With no project open, a save dialog lets you choose a location.

Enter a filename only, without a folder path. Existing files are never overwritten.

## Templates

Run **Markdown: Создать Markdown-файл из шаблона…** from the Command Palette or Explorer context menu to choose a template:

| Template | Contents |
| --- | --- |
| Blank file | An empty Markdown document |
| Note | A heading based on the filename |
| README | Project description, installation, and usage sections |
| Meeting notes | Participants, agenda, decisions, and a task checklist |

**Language note:** the **Markdown File** entry is in English. Additional commands, dialogs, validation messages, and template text are currently in Russian. The command names above match the labels shown in VS Code.

## Markdown preview

Use VS Code's built-in Markdown preview: `Ctrl+Shift+V` on Windows or Linux, or `Cmd+Shift+V` on macOS.

## Installation from VSIX

Requires **Visual Studio Code 1.85 or later**.

Download the `.vsix` package from [GitHub Releases](https://github.com/ortyanetty/markdown-creator/releases).

1. Open the Extensions view.
2. Click **…** and select **Install from VSIX…**.
3. Choose `Ortyanetty.markdown-creator-1.0.2.vsix`.

Alternatively, run this command from the directory containing the package:

```sh
code --install-extension Ortyanetty.markdown-creator-1.0.2.vsix
```

Node.js and npm are not required to install or use the extension.

## Development

The extension is written in JavaScript and needs no build step before running. Open the source folder in VS Code and press `F5` to launch an Extension Development Host.

Run the unit tests with Node.js 18 or later:

```sh
node --test test/unit.test.js
```

Package the extension with Node.js 22 or later and npm:

```sh
npm run package
```

Run integration tests in a separate temporary VS Code profile. Replace the example paths with absolute paths on your system:

```sh
code --extensionDevelopmentPath="/absolute/path/to/markdown-creator" --extensionTestsPath="/absolute/path/to/markdown-creator/test/integration" --user-data-dir="/absolute/path/to/test-profile" --disable-extensions --skip-welcome
```

The test window closes when the tests finish.

The extension icon is a 256×256 PNG at `media/icon.png`, configured in `package.json`. Its editable SVG source is included with the source code and excluded from the VSIX package.

## License

MIT. The license covers the extension code and its original icon.

Source code: [ortyanetty/markdown-creator](https://github.com/ortyanetty/markdown-creator). Report problems through [GitHub Issues](https://github.com/ortyanetty/markdown-creator/issues).

VS Code documentation: [Extension API](https://code.visualstudio.com/api/references/vscode-api) and [Packaging and publishing extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension).
