import {Flags, MAX_VALUE, Registers, Result, System} from '../core';
import {TestRunner, TestSpec} from '../lib';
import {assembleAndBoot} from './helpers';

export const ArithmeticTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('ADDI does addition', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 1200
        ADDI R0, 34
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 1234, 'Register R0 contains result');
  });

  t.test('ADDI sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 0
        ADDI R0, 0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO) == 1, 'Zero flag set');
  });

  t.test('ADDI overflows', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 0xFFFF
        ADDI R0, 1
        END
    `);
    t.assert(result == Result.END, 'Program run');

    t.assert(sys.debug(Registers.R0) == MAX_VALUE, 'Register R0 is MAX_VALUE');
    t.assert((sys.debug(Registers.RFL) >> Flags.OVERFLOW) == 1, 'Overflow flag set');
  });

  t.test('ADDR does addition', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 1200
        MOVI R1, 34
        ADDR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 1234, 'Register R0 contains result');
  });

  t.test('ADDR sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 0
        MOVI R1, 0
        ADDR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO) == 1, 'Zero flag set');
  });

  t.test('ADDR overflows', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 0xFFFF
        MOVI R1, 1
        ADDR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == MAX_VALUE, 'Register R0 is MAX_VALUE');
    t.assert((sys.debug(Registers.RFL) >> Flags.OVERFLOW) == 1, 'Overflow flag set');
  });

  t.test('SUBI does subtraction', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 100
        SUBI R0, 1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 99, 'Register R0 contains result');
  });

  t.test('SUBI sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 100
        SUBI R0, 100
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO) == 1, 'Zero flag set');
  });

  t.test('SUBI sets negative flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 100
        SUBI R0, 101
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.NEGATIVE) == 1, 'Negative flag set');
  });

  t.test('SUBR does subtraction', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 100
        MOVI R1, 1
        SUBR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 99, 'Register R0 contains result');
  });

  t.test('SUBR sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 100
        MOVI R1, 100
        SUBR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO) == 1, 'Zero flag set');
  });

  t.test('SUBR sets negative flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 100
        MOVI R1, 101
        SUBR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.NEGATIVE) == 1, 'Negative flag set');
  });

  t.test('MULI multiplies', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 3
        MULI R0, 5
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 15, 'Register R0 contains result');
  });

  t.test('MULI sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 0
        MULI R0, 5
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO) == 1, 'Zero flag set');
  });

  t.test('MULI sets overflow flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 0xFFFF
        MULI R0, 2
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == MAX_VALUE, 'Register R0 is MAX_VALUE');
    t.assert((sys.debug(Registers.RFL) >> Flags.OVERFLOW) == 1, 'Overflow flag set');
  });

  t.test('MULR multiplies', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 3
        MOVI R1, 5
        MULR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 15, 'Register R0 contains result');
  });

  t.test('MULR sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 0
        MOVI R1, 5
        MULR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO) == 1, 'Zero flag set');
  });

  t.test('MULR sets overflow flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 0xFFFF
        MOVI R1, 2
        MULR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == MAX_VALUE, 'Register R0 is MAX_VALUE');
    t.assert((sys.debug(Registers.RFL) >> Flags.OVERFLOW) == 1, 'Overflow flag set');
  });

  t.test('DIVI divides', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 15
        DIVI R0, 5
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 3, 'Register R0 contains result');
  });

  t.test('DIVI rounds down', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 3
        DIVI R0, 2
        END
    `);

    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 1, 'Register R0 contains result');
  });

  t.test('DIVI sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 0
        DIVI R0, 5
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL)) >> Flags.ZERO == 1, 'Zero flag set');
  });

  t.test('DIVI sets divbyzero flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 5
        DIVI R0, 0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 5, 'Register R0 does not contain result');
    t.assert((sys.debug(Registers.RFL) >> Flags.DIVBYZERO) == 1, 'Divbyzero flag set');
  });

  t.test('DIVR divides', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 15
        MOVI R1, 5
        DIVR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 3, 'Register R0 contains result');
  });

  t.test('DIVR rounds down', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 3
        MOVI R1, 2
        DIVR R0, R1
        END
    `);

    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 1, 'Register R0 contains result');
  });

  t.test('DIVR sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 0
        MOVI R1, 5
        DIVR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL)) >> Flags.ZERO == 1, 'Zero flag set');
  });

  t.test('DIVR sets divbyzero flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 5
        MOVI R1, 0
        DIVR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 5, 'Register R0 does not contain result');
    t.assert((sys.debug(Registers.RFL) >> Flags.DIVBYZERO) == 1, 'Divbyzero flag set');
  });

  t.test('MODI modules', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 3
        MODI R0, 2
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 1, 'Register R0 contains result');
  });

  t.test('MODI sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 0
        MODI R0, 5
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL)) >> Flags.ZERO == 1, 'Zero flag set');
  });

  t.test('MODI sets divbyzero flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 5
        MODI R0, 0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 5, 'Register R0 does not contain result');
    t.assert((sys.debug(Registers.RFL) >> Flags.DIVBYZERO) == 1, 'Divbyzero flag set');
  });

  t.test('MODR modules', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 3
        MOVI R1, 2
        MODR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 1, 'Register R0 contains result');
  });

  t.test('MODR sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 0
        MOVI R1, 5
        MODR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL)) >> Flags.ZERO == 1, 'Zero flag set');
  });

  t.test('MODR sets divbyzero flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 5
        MOVI R1, 0
        MODR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 5, 'Register R0 does not contain result');
    t.assert((sys.debug(Registers.RFL) >> Flags.DIVBYZERO) == 1, 'Divbyzero flag set');
  });

  t.test('INC increments', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 99
        INC R0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 100, 'Register R0 contains result');
  });

  t.test('INC sets overflow flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 0xFFFF
        INC R0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == MAX_VALUE, 'Register R0 set to MAX_VALUE');
    t.assert((sys.debug(Registers.RFL) >> Flags.OVERFLOW) == 1, 'Overflow flag set');
  });

  t.test('DEC decrements', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 100
        DEC R0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 99, 'Register R0 contains result');
  });

  t.test('DEC sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 1
        DEC R0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO) == 1, 'Zero flag set');
  });

  t.test('DEC sets negative flag', () => {
    const result = assembleAndBoot(sys, `
        DEC R0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.NEGATIVE) == 1, 'Negative flag set');
  });
};