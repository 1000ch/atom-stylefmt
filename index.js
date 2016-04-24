'use babel';

import stylefmt from 'stylefmt';
import scss from 'postcss-scss';

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

  let position = editor.getCursorBufferPosition();
  let grammer = editor.getGrammar().name.toLowerCase();
  let text = editor.getText();
  let options = grammer === 'scss' ? { syntax : scss } : {};

  stylefmt.process(text, options).then(result => {
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
