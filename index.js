/* global atom */
'use babel';

import {CompositeDisposable} from 'atom';
import postcss from 'postcss';
import scss from 'postcss-scss';
import stylefmt from 'stylefmt';

let subscriptions;
let editorObserver;
let formatOnSave;

export function activate() {
  subscriptions = new CompositeDisposable();

  subscriptions.add(atom.config.observe('stylefmt.formatOnSave', value => {
    formatOnSave = value;
  }));

  editorObserver = atom.workspace.observeTextEditors(editor => {
    editor.getBuffer().onWillSave(() => {
      if (formatOnSave) {
        execute();
      }
    });
  });

  atom.commands.add('atom-workspace', 'stylefmt:execute', () => {
    execute();
  });
}

export function deactivate() {
  subscriptions.dispose();
  editorObserver.dispose();
}

function execute() {
  const editor = atom.workspace.getActiveTextEditor();

  if (!editor) {
    return;
  }

  const grammar = editor.getGrammar().name.toLowerCase();

  if (['css', 'scss', 'sass', 'less'].indexOf(grammar) === -1) {
    return;
  }

  const position = editor.getCursorBufferPosition();
  const path = editor.getPath() || atom.project.getPaths()[0];
  const text = editor.getText();
  const options = {
    from: path
  };

  if (grammar === 'scss') {
    options.syntax = scss;
  }

  postcss([
    stylefmt()
  ]).process(text, options)
    .then(result => {
      editor.setText(result.css);
      editor.setCursorBufferPosition(position);
    });
}
