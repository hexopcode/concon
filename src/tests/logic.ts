import {Flags, MAX_VALUE, Registers, Result, System} from '../core';
import {TestRunner, TestSpec} from '../lib';
import {assembleAndBoot} from './helpers';

export const LogicTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('SHLI shifts', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 1
        SHLI R0, 3
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 8, 'Register R0 contains result');
  });

  t.test('SHLI sets overflow flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 0xFFFF
        SHLI R0, 1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == MAX_VALUE, 'Register R0 set to MAX_VALUE');
    t.assert((sys.debug(Registers.RFL) >> Flags.OVERFLOW) == 1, 'Overflow flag set');
  });

  t.test('SHLR shifts', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 1
        MOVI R1, 3
        SHLR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 8, 'Register R0 contains result');
  });

  t.test('SHLR sets overflow flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 0xFFFF
        MOVI R1, 1
        SHLR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == MAX_VALUE, 'Register R0 set to MAX_VALUE');
    t.assert((sys.debug(Registers.RFL) >> Flags.OVERFLOW) == 1, 'Overflow flag set');
  });

  t.test('SHRI shifts', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 8
        SHRI R0, 3
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 1, 'Register R0 contains result');
  });

  t.test('SHRI sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 1
        SHRI R0, 2
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO) == 1, 'Zero flag set');
  });

  t.test('SHRR shifts', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 8
        MOVI R1, 3
        SHRR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 1, 'Register R0 contains result');
  });

  t.test('SHRR sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 1
        MOVI R1, 2
        SHRR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO) == 1, 'Zero flag set');
  });

  t.test('ORI ors', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 8
        ORI R0, 3
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 11, 'Register R0 contains result');
  });

  t.test('ORI sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 0
        ORI R0, 0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO) == 1, 'Zero flag set');
  });

  t.test('ORR ors', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 8
        MOVI R1, 3
        ORR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 11, 'Register R0 contains result');
  });

  t.test('ORR sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 0
        MOVI R1, 0
        ORR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO) == 1, 'Zero flag set');
  });

  t.test('ANDI ands', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 8
        ANDI R0, 9
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 8, 'Register R0 contains result');
  });

  t.test('ANDI sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 8
        ANDI R0, 0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO) == 1, 'Zero flag set');
  });

  t.test('ANDR ands', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 8
        MOVI R1, 9
        ANDR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 8, 'Register R0 contains result');
  });

  t.test('ANDR sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 8
        MOVI R1, 0
        ANDR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO) == 1, 'Zero flag set');
  });

  t.test('XORI xors', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 0b101
        XORI R0, 0b110
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 0b011, 'Register R0 contains result');
  });

  t.test('XORI sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 8
        XORI R0, 8
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO) == 1, 'Zero flag set');
  });

  t.test('XORR ands', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 0b101
        MOVI R1, 0b110
        XORR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 0b011, 'Register R0 contains result');
  });

  t.test('XORR sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 8
        MOVI R1, 8
        XORR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO) == 1, 'Zero flag set');
  });

  t.test('NOT nots', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 0xFF00
        NOT R0
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 0x00FF, 'Register R0 contains result');
  });

  t.test('NOT sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 0xFFFF
        NOT R0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO) == 1, 'Zero flag set');
  });
};