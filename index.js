'use babel';

import postcss from 'postcss';
import cssfmt  from 'cssfmt';

export let config = {
  executeOnSave: {
    title: 'Execute on save',
    description: 'Formatting CSS on save.',
    type: 'boolean',
    default: false
  }
};

const executeOnSave = () => atom.config.get('cssfmt.executeOnSave');

const execute = () => {

  const editor = atom.workspace.getActiveTextEditor();

  if (!editor) {
    return;
  }

  let text = editor.getText();
  let selectedText = editor.getSelectedText();
  let formatter = postcss().use(cssfmt());

  if (selectedText.length !== 0) {
    try {
      editor.setTextInBufferRange(
        editor.getSelectedBufferRange(),
        formatter.process(selectedText).css
      );
    } catch (e) {}
  } else {
    try {
      editor.setText(formatter.process(text).css);
    } catch (e) {}
  }
};

let editorObserver = null;

export const activate = (state) => {

  atom.commands.add('atom-workspace', 'cssfmt:execute', () => {
    execute();
  });

  editorObserver = atom.workspace.observeTextEditors((editor) => {
    editor.getBuffer().onWillSave(() => {
      if (executeOnSave()) {
        execute();
      }
    });
  });
};

export const deactivate = () => {
  editorObserver.dispose();
};
