import {Flags, MAX_VALUE, Registers, Result, System} from '../core';
import {TestRunner, TestSpec} from '../lib';
import {assembleAndBoot} from './helpers';

export const ArithmeticTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('ADD does ADDtion', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 1200
        ADD R0, 34
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 1234, 'Register R0 contains result');
  });

  t.test('ADD sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0
        ADD R0, 0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('ADD overflows', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0xFFFF
        ADD R0, 1
        END
    `);
    t.assert(result == Result.END, 'Program run');

    t.assert(sys.debug(Registers.R0) == MAX_VALUE, 'Register R0 is MAX_VALUE');
    t.assert((sys.debug(Registers.RFL) >> Flags.OVERFLOW & 1) == 1, 'Overflow flag set');
  });

  t.test('ADD does ADDtion', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 1200
        MOV R1, 34
        ADD R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 1234, 'Register R0 contains result');
  });

  t.test('ADD sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0
        MOV R1, 0
        ADD R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('ADD overflows', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0xFFFF
        MOV R1, 1
        ADD R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == MAX_VALUE, 'Register R0 is MAX_VALUE');
    t.assert((sys.debug(Registers.RFL) >> Flags.OVERFLOW & 1) == 1, 'Overflow flag set');
  });

  t.test('SUB does subtraction', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 100
        SUB R0, 1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 99, 'Register R0 contains result');
  });

  t.test('SUB sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 100
        SUB R0, 100
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('SUB sets negative flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 100
        SUB R0, 101
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.NEGATIVE & 1) == 1, 'Negative flag set');
  });

  t.test('SUB does subtraction', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 100
        MOV R1, 1
        SUB R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 99, 'Register R0 contains result');
  });

  t.test('SUB sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 100
        MOV R1, 100
        SUB R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('SUB sets negative flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 100
        MOV R1, 101
        SUB R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.NEGATIVE & 1) == 1, 'Negative flag set');
  });

  t.test('MUL multiplies', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 3
        MUL R0, 5
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 15, 'Register R0 contains result');
  });

  t.test('MUL sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0
        MUL R0, 5
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('MUL sets overflow flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0xFFFF
        MUL R0, 2
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == MAX_VALUE, 'Register R0 is MAX_VALUE');
    t.assert((sys.debug(Registers.RFL) >> Flags.OVERFLOW & 1) == 1, 'Overflow flag set');
  });

  t.test('MUL multiplies', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 3
        MOV R1, 5
        MUL R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 15, 'Register R0 contains result');
  });

  t.test('MUL sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0
        MOV R1, 5
        MUL R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('MUL sets overflow flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0xFFFF
        MOV R1, 2
        MUL R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == MAX_VALUE, 'Register R0 is MAX_VALUE');
    t.assert((sys.debug(Registers.RFL) >> Flags.OVERFLOW & 1) == 1, 'Overflow flag set');
  });

  t.test('DIV divides', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 15
        DIV R0, 5
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 3, 'Register R0 contains result');
  });

  t.test('DIV rounds down', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 3
        DIV R0, 2
        END
    `);

    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 1, 'Register R0 contains result');
  });

  t.test('DIV sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0
        DIV R0, 5
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('DIV sets divbyzero flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 5
        DIV R0, 0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 5, 'Register R0 does not contain result');
    t.assert((sys.debug(Registers.RFL) >> Flags.DIVBYZERO & 1) == 1, 'Divbyzero flag set');
  });

  t.test('DIV divides', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 15
        MOV R1, 5
        DIV R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 3, 'Register R0 contains result');
  });

  t.test('DIV rounds down', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 3
        MOV R1, 2
        DIV R0, R1
        END
    `);

    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 1, 'Register R0 contains result');
  });

  t.test('DIV sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0
        MOV R1, 5
        DIV R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('DIV sets divbyzero flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 5
        MOV R1, 0
        DIV R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 5, 'Register R0 does not contain result');
    t.assert((sys.debug(Registers.RFL) >> Flags.DIVBYZERO & 1) == 1, 'Divbyzero flag set');
  });

  t.test('MOD modules', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 3
        MOD R0, 2
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 1, 'Register R0 contains result');
  });

  t.test('MOD sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0
        MOD R0, 5
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('MOD sets divbyzero flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 5
        MOD R0, 0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 5, 'Register R0 does not contain result');
    t.assert((sys.debug(Registers.RFL) >> Flags.DIVBYZERO & 1) == 1, 'Divbyzero flag set');
  });

  t.test('MOD modules', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 3
        MOV R1, 2
        MOD R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 1, 'Register R0 contains result');
  });

  t.test('MOD sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0
        MOV R1, 5
        MOD R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('MOD sets divbyzero flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 5
        MOV R1, 0
        MOD R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 5, 'Register R0 does not contain result');
    t.assert((sys.debug(Registers.RFL) >> Flags.DIVBYZERO & 1) == 1, 'Divbyzero flag set');
  });

  t.test('INC increments', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 99
        INC R0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 100, 'Register R0 contains result');
  });

  t.test('INC sets overflow flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0xFFFF
        INC R0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == MAX_VALUE, 'Register R0 set to MAX_VALUE');
    t.assert((sys.debug(Registers.RFL) >> Flags.OVERFLOW & 1) == 1, 'Overflow flag set');
  });

  t.test('DEC decrements', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 100
        DEC R0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 99, 'Register R0 contains result');
  });

  t.test('DEC sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 1
        DEC R0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('DEC sets negative flag', () => {
    const result = assembleAndBoot(sys, `
        DEC R0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.NEGATIVE & 1) == 1, 'Negative flag set');
  });
};