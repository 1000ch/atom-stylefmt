'use babel';

import * as path from 'path';
import postcss from 'postcss';
import scss from 'postcss-scss';
import stylefmt from 'stylefmt';

export const config = {
  formatOnSave: {
    title: 'Format on Save',
    description: 'Execute formatting CSS on save.',
    type: 'boolean',
    default: false
  }
};

function execute() {
  const editor = atom.workspace.getActiveTextEditor();

  if (!editor) {
    return;
  }

  const position = editor.getCursorBufferPosition();
  const grammer = editor.getGrammar().name.toLowerCase();
  const paths = atom.project.getPaths();
  const text = editor.getText();
  const options = grammer === 'scss' ? {
    syntax : scss
  } : {};

  postcss([
    stylefmt({
      config: `${paths[0]}/.stylelintrc`
    })
  ]).process(text, options)
    .then(result => {
      editor.setText(result.css);
      editor.setCursorBufferPosition(position);
    });
}

let editorObserver;
let formatOnSave;

export function activate(state) {
  atom.commands.add('atom-workspace', 'stylefmt:execute', () => {
    execute();
  });

  editorObserver = atom.workspace.observeTextEditors(editor => {
    editor.getBuffer().onWillSave(() => {
      if (formatOnSave) {
        execute();
      }
    });
  });

  formatOnSave = atom.config.get('stylefmt.formatOnSave');

  atom.config.observe('stylefmt.formatOnSave', value => {
    formatOnSave = value;
  });
}

export function deactivate() {
  editorObserver.dispose();
}
