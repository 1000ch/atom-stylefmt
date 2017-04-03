'use babel';

import { join } from 'path';
import { format } from '..';

const fixture = join(__dirname, 'fixture.css');

describe('stylefmt plugin for Atom', () => {
  beforeEach(() => {
    atom.workspace.destroyActivePaneItem();

    waitsForPromise(() =>
      Promise.all([
        atom.packages.activatePackage('language-css')
      ])
    );
  });

  describe('define functions', () => {
    it('have format()', () => {
      expect(typeof format).toEqual('function');
    });
  });

  describe('process fixture.css and', () => {
    it('format', () => {
      waitsForPromise(() => {
        return atom.workspace.open(fixture)
          .then(editor => format(editor))
          .then(editor => {
            expect(editor.getText()).toEqual(`.foo {
  display: block;
}
`);
          });
      });
    });
  });
});
