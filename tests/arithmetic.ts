import {Flags, MAX_VALUE, Registers, Result, System} from '../src/core';
import {TestRunner, TestSpec} from '../src/lib';
import {assembleAndBoot} from './helpers';

export const ArithmeticTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('add does addition', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 1200
        add r0, 34
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 1234, 'Register R0 contains result');
  });

  t.test('add sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0
        add r0, 0
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('add overflows', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0xffff
        add r0, 1
        end
    `);
    t.assert(result == Result.END, 'Program run');

    t.assert(sys.debug(Registers.R0) == MAX_VALUE, 'Register R0 is MAX_VALUE');
    t.assert((sys.debug(Registers.RFL) >> Flags.OVERFLOW & 1) == 1, 'Overflow flag set');
  });

  t.test('add does addtion', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 1200
        mov r1, 34
        add r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 1234, 'Register R0 contains result');
  });

  t.test('add sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0
        mov r1, 0
        add r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('add overflows', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0xffff
        mov r1, 1
        add r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == MAX_VALUE, 'Register R0 is MAX_VALUE');
    t.assert((sys.debug(Registers.RFL) >> Flags.OVERFLOW & 1) == 1, 'Overflow flag set');
  });

  t.test('sub does subtraction', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 100
        sub r0, 1
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 99, 'Register R0 contains result');
  });

  t.test('sub sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 100
        sub r0, 100
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('sub sets negative flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 100
        sub r0, 101
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.NEGATIVE & 1) == 1, 'Negative flag set');
  });

  t.test('sub does subtraction', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 100
        mov r1, 1
        sub r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 99, 'Register R0 contains result');
  });

  t.test('sub sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 100
        mov r1, 100
        sub r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('sub sets negative flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 100
        mov r1, 101
        sub r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.NEGATIVE & 1) == 1, 'Negative flag set');
  });

  t.test('mul multiplies', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 3
        mul r0, 5
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 15, 'Register R0 contains result');
  });

  t.test('mul sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0
        mul r0, 5
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('mul sets overflow flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0xffff
        mul r0, 2
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == MAX_VALUE, 'Register R0 is MAX_VALUE');
    t.assert((sys.debug(Registers.RFL) >> Flags.OVERFLOW & 1) == 1, 'Overflow flag set');
  });

  t.test('mul multiplies', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 3
        mov r1, 5
        mul r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 15, 'Register R0 contains result');
  });

  t.test('mul sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0
        mov r1, 5
        mul r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('mul sets overflow flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0xFFFF
        mov r1, 2
        mul r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == MAX_VALUE, 'Register R0 is MAX_VALUE');
    t.assert((sys.debug(Registers.RFL) >> Flags.OVERFLOW & 1) == 1, 'Overflow flag set');
  });

  t.test('div divides', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 15
        div r0, 5
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 3, 'Register R0 contains result');
  });

  t.test('div rounds down', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 3
        div r0, 2
        end
    `);

    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 1, 'Register R0 contains result');
  });

  t.test('div sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0
        div r0, 5
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('div sets divbyzero flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 5
        div r0, 0
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 5, 'Register R0 does not contain result');
    t.assert((sys.debug(Registers.RFL) >> Flags.DIVBYZERO & 1) == 1, 'Divbyzero flag set');
  });

  t.test('div divides', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 15
        mov r1, 5
        div r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 3, 'Register R0 contains result');
  });

  t.test('div rounds down', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 3
        mov r1, 2
        div r0, r1
        end
    `);

    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 1, 'Register R0 contains result');
  });

  t.test('div sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0
        mov r1, 5
        div r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('div sets divbyzero flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 5
        mov r1, 0
        div r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 5, 'Register R0 does not contain result');
    t.assert((sys.debug(Registers.RFL) >> Flags.DIVBYZERO & 1) == 1, 'Divbyzero flag set');
  });

  t.test('mod modules', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 3
        mod r0, 2
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 1, 'Register R0 contains result');
  });

  t.test('mod sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0
        mod r0, 5
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('mod sets divbyzero flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 5
        mod r0, 0
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 5, 'Register R0 does not contain result');
    t.assert((sys.debug(Registers.RFL) >> Flags.DIVBYZERO & 1) == 1, 'Divbyzero flag set');
  });

  t.test('mod modules', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 3
        mov r1, 2
        mod r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 1, 'Register R0 contains result');
  });

  t.test('mod sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0
        mov r1, 5
        mod r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('mod sets divbyzero flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 5
        mov r1, 0
        mod r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 5, 'Register R0 does not contain result');
    t.assert((sys.debug(Registers.RFL) >> Flags.DIVBYZERO & 1) == 1, 'Divbyzero flag set');
  });

  t.test('inc increments', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 99
        inc r0
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 100, 'Register R0 contains result');
  });

  t.test('inc sets overflow flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0xFFFF
        inc r0
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == MAX_VALUE, 'Register R0 set to MAX_VALUE');
    t.assert((sys.debug(Registers.RFL) >> Flags.OVERFLOW & 1) == 1, 'Overflow flag set');
  });

  t.test('dec decrements', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 100
        dec r0
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 99, 'Register R0 contains result');
  });

  t.test('dec sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 1
        dec r0
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('dec sets negative flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0
        dec r0
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.NEGATIVE & 1) == 1, 'Negative flag set');
  });
};