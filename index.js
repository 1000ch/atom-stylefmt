'use babel';

import cssfmt  from 'cssfmt';

export let config = {
  formatOnSave: {
    title: 'Format on Save',
    description: 'Execute formatting CSS on save.',
    type: 'boolean',
    default: false
  }
};

const formatOnSave = () => atom.config.get('cssfmt.formatOnSave');

const execute = () => {

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
    } catch (e) {}
  } else {
    try {
      let css = cssfmt.process(text);
      editor.setText(css);
    } catch (e) {}
  }

  editor.setCursorBufferPosition(position);
};

let editorObserver = null;

export const activate = (state) => {

  atom.commands.add('atom-workspace', 'cssfmt:execute', () => {
    execute();
  });

  editorObserver = atom.workspace.observeTextEditors((editor) => {
    editor.getBuffer().onWillSave(() => {
      if (formatOnSave()) {
        execute();
      }
    });
  });
};

export const deactivate = () => {
  editorObserver.dispose();
};
