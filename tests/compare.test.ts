import {Flags, Registers, Result, System} from '../src/core';
import {TestRunner, TestSpec, assembleAndBoot} from '../src/lib/testing';

export const CompareTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('cmp compares equals', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0xFFFF
        cmp r0, 0xFFFF
        end
    `)).is(Result.END);
    
    t.assertThat((sys.debug(Registers.RFL) >> Flags.ZERO & 1)).is(1);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.NEGATIVE & 1)).is(0);
  });

  t.test('cmp compares higher value', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0x1234
        cmp r0, 0xFFFF
        end
    `)).is(Result.END);

    t.assertThat((sys.debug(Registers.RFL) >> Flags.ZERO & 1)).is(0);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.NEGATIVE & 1)).is(1);
  });

  t.test('cmp compares lower value', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0xFFFF
        cmp r0, 0x1234
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.RFL)).is(0);
  });

  t.test('cmp compares equals', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0xFFFF
        mov r1, 0xFFFF
        cmp r0, r1
        end
    `)).is(Result.END);
    
    t.assertThat((sys.debug(Registers.RFL) >> Flags.ZERO & 1)).is(1);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.NEGATIVE & 1)).is(0);
  });

  t.test('cmp compares higher value', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0x1234
        mov r1, 0xFFFF
        cmp r0, r1
        end
    `)).is(Result.END);

    t.assertThat((sys.debug(Registers.RFL) >> Flags.ZERO & 1)).is(0);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.NEGATIVE & 1)).is(1);
  });

  t.test('cmp compares lower value', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0xFFFF
        mov r1, 0x1234
        cmp r0, r1
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.RFL)).is(0);
  });
};