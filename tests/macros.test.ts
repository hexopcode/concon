import {Registers, Result, System} from '../src/core';
import {Source} from '../src/lib/source';
import {TestRunner, TestSpec, assembleAndBoot, assembleMultiple} from '../src/lib/testing';

export const MacrosTests: TestSpec = (t: TestRunner) => {
  const sys = new System(true);

  t.before(() => {
    sys.reset();
  });

  t.test('immediates', () => {
    t.assertThat(assembleAndBoot(sys, `
        imm16 foo: 0x1234
        imm8 bar: 0x99

        mov r0, foo
        mov r1, bar
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0x1234);
    t.assertThat(sys.debug(Registers.R1)).is(0x99);
  });

  t.test('immediates with uses', () => {
    const lib: Source = {
      path: 'foo.lib.con',
      code: `
          pub imm16 foo: 0x1234
      `,
      library: true,
    };
    const main: Source = {
      path: 'main.con',
      code: `
          use foo from foo.lib.con

          mov r0, foo
          end
      `,
      library: false,
    };

    t.assertThat(assembleMultiple(sys, 'main.con', [lib, main])).is(Result.END);
    t.assertThat(sys.debug(Registers.R0)).is(0x1234);
  });
}