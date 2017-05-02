'use babel';

import { CompositeDisposable } from 'atom';
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
        format(atom.workspace.getActiveTextEditor());
      }
    });
  });

  atom.commands.add('atom-text-editor:not([mini])', 'stylefmt:format', () => {
    format(atom.workspace.getActiveTextEditor());
  });
}

export function deactivate() {
  subscriptions.dispose();
  editorObserver.dispose();
}

export function format(editor) {
  if (!editor) {
    return Promise.reject(new Error('Editor is invalid'));
  }

  const grammar = editor.getGrammar().name.toLowerCase();

  if (['css', 'scss', 'sass', 'less'].indexOf(grammar) === -1) {
    return Promise.reject(new Error(`${grammar} is not supported.`));
  }

  const path = editor.getPath();
  const text = editor.getText();
  const options = {
    from: path
  };

  if (grammar === 'scss') {
    options.syntax = scss;
  }

  return postcss([stylefmt()]).process(text, options)
    .then(result => setText(editor, result.css))
    .catch(error => atom.notifications.addError(error.toString(), {}));
}

function setText(editor, text) {
  const position = editor.getCursorBufferPosition();
  editor.setText(text);
  editor.setCursorBufferPosition(position);
  return editor;
}
