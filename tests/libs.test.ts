import {Registers, Result, System} from '../src/core';
import {Source} from '../src/lib/source';
import {TestRunner, TestSpec, assembleMultiple} from '../src/lib/testing';

export const LibsTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('use uses pub', () => {
    const lib: Source = {
      path: 'foo.lib.con',
      code: `
          pub proc foo:
            mov r0, 0x1234
            ret
      `,
      library: true,
    };
    const main: Source = {
      path: 'main.con',
      code: `
          use foo from foo.lib.con

          call foo
          end
      `,
      library: false,
    }

    t.assertThat(assembleMultiple(sys, 'main.con', [lib, main])).is(Result.END);
    t.assertThat(sys.debug(Registers.R0)).is(0x1234);
  });
}