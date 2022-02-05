import {Flags, Registers, Result, System} from '../core';
import {TestRunner, TestSpec} from '../lib';
import {assembleAndBoot} from './helpers';

export const CompareTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('CMPI compares equals', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 0xFFFF
        CMPI R0, 0xFFFF
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
    t.assert((sys.debug(Registers.RFL) >> Flags.NEGATIVE & 1) == 0, 'Negative flag not set');
  });

  t.test('CMPI compares higher value', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 0x1234
        CMPI R0, 0xFFFF
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 0, 'Zero flag not set');
    t.assert((sys.debug(Registers.RFL) >> Flags.NEGATIVE & 1) == 1, 'Negative flag set');
  });

  t.test('CMPI compares lower value', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 0xFFFF
        CMPI R0, 0x1234
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.RFL) == 0, 'Flags not set');
  });

  t.test('CMPR compares equals', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 0xFFFF
        MOVI R1, 0xFFFF
        CMPR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
    t.assert((sys.debug(Registers.RFL) >> Flags.NEGATIVE & 1) == 0, 'Negative flag not set');
  });

  t.test('CMPR compares higher value', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 0x1234
        MOVI R1, 0xFFFF
        CMPR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 0, 'Zero flag not set');
    t.assert((sys.debug(Registers.RFL) >> Flags.NEGATIVE & 1) == 1, 'Negative flag set');
  });

  t.test('CMPR compares lower value', () => {
    const result = assembleAndBoot(sys, `
        MOVI R0, 0xFFFF
        MOVI R1, 0x1234
        CMPR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.RFL) == 0, 'Flags not set');
  });
};