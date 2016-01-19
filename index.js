'use babel';

import cssfmt from 'cssfmt';

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
  let text = editor.getText();
  let selectedText = editor.getSelectedText();

  if (selectedText.length !== 0) {
    try {
      let range = editor.getSelectedBufferRange();
      let css = cssfmt.process(selectedText);
      editor.setTextInBufferRange(range, css);
      editor.setCursorBufferPosition(position);
    } catch (e) {
      console.error(e);
    }
  } else {
    try {
      let css = cssfmt.process(text);
      editor.setText(css);
      editor.setCursorBufferPosition(position);
    } catch (e) {
      console.error(e);
    }
  }
}

let editorObserver;
let formatOnSave;

export function activate(state) {
  atom.commands.add('atom-workspace', 'cssfmt:execute', () => {
    execute();
  });

  editorObserver = atom.workspace.observeTextEditors(editor => {
    editor.getBuffer().onWillSave(() => {
      if (formatOnSave) {
        execute();
      }
    });
  });

  formatOnSave = atom.config.get('cssfmt.formatOnSave');

  atom.config.observe('cssfmt.formatOnSave', value => formatOnSave = value);
}

export function deactivate() {
  editorObserver.dispose();
}
