import {Flags, MAX_VALUE, Registers, Result, System} from '../core';
import {TestRunner, TestSpec} from '../lib';
import {assembleAndBoot} from './helpers';

export const LogicTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('SHL shifts', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 1
        SHL R0, 3
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 8, 'Register R0 contains result');
  });

  t.test('SHL sets overflow flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0xFFFF
        SHL R0, 1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == MAX_VALUE, 'Register R0 set to MAX_VALUE');
    t.assert((sys.debug(Registers.RFL) >> Flags.OVERFLOW & 1) == 1, 'Overflow flag set');
  });

  t.test('SHL shifts', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 1
        MOV R1, 3
        SHL R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 8, 'Register R0 contains result');
  });

  t.test('SHL sets overflow flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0xFFFF
        MOV R1, 1
        SHL R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == MAX_VALUE, 'Register R0 set to MAX_VALUE');
    t.assert((sys.debug(Registers.RFL) >> Flags.OVERFLOW & 1) == 1, 'Overflow flag set');
  });

  t.test('SHR shifts', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 8
        SHR R0, 3
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 1, 'Register R0 contains result');
  });

  t.test('SHR sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 1
        SHR R0, 2
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('SHR shifts', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 8
        MOV R1, 3
        SHR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 1, 'Register R0 contains result');
  });

  t.test('SHR sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 1
        MOV R1, 2
        SHR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('OR ors', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 8
        OR R0, 3
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 11, 'Register R0 contains result');
  });

  t.test('OR sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0
        OR R0, 0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('OR ors', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 8
        MOV R1, 3
        OR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 11, 'Register R0 contains result');
  });

  t.test('OR sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0
        MOV R1, 0
        OR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('AND ands', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 8
        AND R0, 9
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 8, 'Register R0 contains result');
  });

  t.test('AND sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 8
        AND R0, 0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('AND ands', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 8
        MOV R1, 9
        AND R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 8, 'Register R0 contains result');
  });

  t.test('AND sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 8
        MOV R1, 0
        AND R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('XOR xors', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0b101
        XOR R0, 0b110
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 0b011, 'Register R0 contains result');
  });

  t.test('XOR sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 8
        XOR R0, 8
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('XOR ands', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0b101
        MOV R1, 0b110
        XOR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 0b011, 'Register R0 contains result');
  });

  t.test('XOR sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 8
        MOV R1, 8
        XOR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('NOT nots', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0xFF00
        NOT R0
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 0x00FF, 'Register R0 contains result');
  });

  t.test('NOT sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0xFFFF
        NOT R0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });
};