import {Flags, MAX_VALUE, Registers, Result, System} from '../src/core';
import {TestRunner, TestSpec} from '../src/lib';
import {assembleAndBoot} from './helpers';

export const LogicTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('shl shifts', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 1
        shl r0, 3
        end
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 8, 'Register R0 contains result');
  });

  t.test('shl sets overflow flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0xFFFF
        shl r0, 1
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == MAX_VALUE, 'Register R0 set to MAX_VALUE');
    t.assert((sys.debug(Registers.RFL) >> Flags.OVERFLOW & 1) == 1, 'Overflow flag set');
  });

  t.test('shl shifts', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 1
        mov r1, 3
        shl r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 8, 'Register R0 contains result');
  });

  t.test('shl sets overflow flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0xFFFF
        mov r1, 1
        shl r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == MAX_VALUE, 'Register R0 set to MAX_VALUE');
    t.assert((sys.debug(Registers.RFL) >> Flags.OVERFLOW & 1) == 1, 'Overflow flag set');
  });

  t.test('shr shifts', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 8
        shr r0, 3
        end
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 1, 'Register R0 contains result');
  });

  t.test('shr sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 1
        shr r0, 2
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('shr shifts', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 8
        mov r1, 3
        shr r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 1, 'Register R0 contains result');
  });

  t.test('shr sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 1
        mov r1, 2
        shr r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('or ors', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 8
        or r0, 3
        end
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 11, 'Register R0 contains result');
  });

  t.test('or sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0
        or r0, 0
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('or ors', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 8
        mov r1, 3
        or r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 11, 'Register R0 contains result');
  });

  t.test('or sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0
        mov r1, 0
        or r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('and ands', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 8
        and r0, 9
        end
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 8, 'Register R0 contains result');
  });

  t.test('and sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 8
        and r0, 0
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('and ands', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 8
        mov r1, 9
        and r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 8, 'Register R0 contains result');
  });

  t.test('and sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 8
        mov r1, 0
        and r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('xor xors', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0b101
        xor r0, 0b110
        end
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 0b011, 'Register R0 contains result');
  });

  t.test('xor sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 8
        xor r0, 8
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('xor ands', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0b101
        mov r1, 0b110
        xor r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 0b011, 'Register R0 contains result');
  });

  t.test('xor sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 8
        mov r1, 8
        xor r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });

  t.test('not nots', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0xFF00
        not r0
        end
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 0x00FF, 'Register R0 contains result');
  });

  t.test('not sets zero flag', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0xFFFF
        not r0
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
  });
};