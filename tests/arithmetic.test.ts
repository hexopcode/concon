import {Flags, MAX_VALUE, Registers, Result, System} from '../src/core';
import {TestRunner, TestSpec, assembleAndBoot} from '../src/lib/testing';

export const ArithmeticTests: TestSpec = (t: TestRunner) => {
  const sys = new System(true);

  t.before(() => {
    sys.reset();
  });

  t.test('add does addition', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 1200
        add r0, 34
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(1234);
  });

  t.test('add sets zero flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0
        add r0, 0
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.ZERO & 1)).is(1);
  });

  t.test('add overflows', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0xffff
        add r0, 1
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(MAX_VALUE);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.OVERFLOW & 1)).is(1);
  });

  t.test('add does addtion', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 1200
        mov r1, 34
        add r0, r1
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(1234);
  });

  t.test('add sets zero flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0
        mov r1, 0
        add r0, r1
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.ZERO & 1)).is(1);
  });

  t.test('add overflows', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0xffff
        mov r1, 1
        add r0, r1
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(MAX_VALUE);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.OVERFLOW & 1)).is(1);
  });

  t.test('sub does subtraction', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 100
        sub r0, 1
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(99);
  });

  t.test('sub sets zero flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 100
        sub r0, 100
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.ZERO & 1)).is(1);
  });

  t.test('sub sets negative flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 100
        sub r0, 101
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.NEGATIVE & 1)).is(1);
  });

  t.test('sub does subtraction', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 100
        mov r1, 1
        sub r0, r1
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(99);
  });

  t.test('sub sets zero flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 100
        mov r1, 100
        sub r0, r1
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.ZERO & 1)).is(1);
  });

  t.test('sub sets negative flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 100
        mov r1, 101
        sub r0, r1
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.NEGATIVE & 1)).is(1);
  });

  t.test('mul multiplies', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 3
        mul r0, 5
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(15);
  });

  t.test('mul sets zero flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0
        mul r0, 5
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.ZERO & 1)).is(1);
  });

  t.test('mul sets overflow flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0xffff
        mul r0, 2
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(MAX_VALUE);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.OVERFLOW & 1)).is(1);
  });

  t.test('mul multiplies', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 3
        mov r1, 5
        mul r0, r1
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(15);
  });

  t.test('mul sets zero flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0
        mov r1, 5
        mul r0, r1
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.ZERO & 1)).is(1);
  });

  t.test('mul sets overflow flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0xFFFF
        mov r1, 2
        mul r0, r1
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(MAX_VALUE);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.OVERFLOW & 1)).is(1);
  });

  t.test('div divides', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 15
        div r0, 5
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(3);
  });

  t.test('div rounds down', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 3
        div r0, 2
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(1);
  });

  t.test('div sets zero flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0
        div r0, 5
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.ZERO & 1)).is(1);
  });

  t.test('div sets divbyzero flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 5
        div r0, 0
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(5);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.DIVBYZERO & 1)).is(1);
  });

  t.test('div divides', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 15
        mov r1, 5
        div r0, r1
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(3);
  });

  t.test('div rounds down', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 3
        mov r1, 2
        div r0, r1
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(1);
  });

  t.test('div sets zero flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0
        mov r1, 5
        div r0, r1
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.ZERO & 1)).is(1);
  });

  t.test('div sets divbyzero flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 5
        mov r1, 0
        div r0, r1
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(5);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.DIVBYZERO & 1)).is(1);
  });

  t.test('mod modules', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 3
        mod r0, 2
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(1);
  });

  t.test('mod sets zero flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0
        mod r0, 5
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.ZERO & 1)).is(1);
  });

  t.test('mod sets divbyzero flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 5
        mod r0, 0
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(5);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.DIVBYZERO & 1)).is(1);
  });

  t.test('mod modules', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 3
        mov r1, 2
        mod r0, r1
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(1);
  });

  t.test('mod sets zero flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0
        mov r1, 5
        mod r0, r1
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.ZERO & 1)).is(1);
  });

  t.test('mod sets divbyzero flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 5
        mov r1, 0
        mod r0, r1
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(5);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.DIVBYZERO & 1)).is(1);
  });

  t.test('inc increments', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 99
        inc r0
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(100);
  });

  t.test('inc sets overflow flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0xFFFF
        inc r0
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(MAX_VALUE);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.OVERFLOW & 1)).is(1);
  });

  t.test('dec decrements', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 100
        dec r0
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(99);
  });

  t.test('dec sets zero flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 1
        dec r0
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.ZERO & 1)).is(1);
  });

  t.test('dec sets negative flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0
        dec r0
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.NEGATIVE & 1)).is(1);
  });
};