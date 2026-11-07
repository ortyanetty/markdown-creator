'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeName, validateName, templateText } = require('../src/create-markdown');
const manifest = require('../package.json');

test('New File menu is connected to a declared command without conditions', () => {
  const menu = manifest.contributes.menus['file/newFile'];
  assert.equal(menu.length, 1);
  assert.equal(menu[0].command, 'markdownCreator.newFile');
  assert.equal(menu[0].when, undefined);
  assert.equal(manifest.contributes.commands.find(c => c.command === menu[0].command).title, 'Markdown File');
});

test('adds .md once, including uppercase and Cyrillic names', () => {
  assert.equal(normalizeName('заметки'), 'заметки.md');
  assert.equal(normalizeName(' README.md '), 'README.md');
  assert.equal(normalizeName('NOTE.MD'), 'NOTE.MD');
  assert.equal(normalizeName('release.v1'), 'release.v1.md');
});

test('rejects traversal, reserved names and invalid characters', () => {
  for (const name of ['', ' ', '.', '..', '.md', '../x', 'a/b', 'a\\b', 'a:b', 'a*', 'a?', 'a|', 'a<', 'a>', 'a"', 'a\nb', 'a\0b', 'CON', 'nul.md', 'COM1.txt', 'LPT9', 'end.', 'a'.repeat(253)]) {
    assert.ok(validateName(name), `Expected rejection: ${JSON.stringify(name)}`);
  }
});

test('accepts usable filenames', () => {
  for (const name of ['заметки', 'README.md', 'meeting-2026-11-07', 'a'.repeat(252), 'my note.MD', '.notes.md', 'COM10']) {
    assert.equal(validateName(name), undefined, name);
  }
});

test('templates use the filename title and valid Markdown sections', () => {
  assert.equal(templateText('empty', 'note.md'), '');
  assert.equal(templateText('note', 'моя-заметка.md'), '# моя заметка\n\n');
  assert.match(templateText('readme', 'README.md'), /## Установка/);
  assert.match(templateText('meeting', 'meeting.md'), /- \[ \]/);
});
