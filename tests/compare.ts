import {Flags, Registers, Result, System} from '../src/core';
import {TestRunner, TestSpec} from '../src/lib';
import {assembleAndBoot} from './helpers';

export const CompareTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('CMP compares equals', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0xFFFF
        CMP R0, 0xFFFF
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
    t.assert((sys.debug(Registers.RFL) >> Flags.NEGATIVE & 1) == 0, 'Negative flag not set');
  });

  t.test('CMP compares higher value', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x1234
        CMP R0, 0xFFFF
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 0, 'Zero flag not set');
    t.assert((sys.debug(Registers.RFL) >> Flags.NEGATIVE & 1) == 1, 'Negative flag set');
  });

  t.test('CMP compares lower value', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0xFFFF
        CMP R0, 0x1234
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.RFL) == 0, 'Flags not set');
  });

  t.test('CMP compares equals', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0xFFFF
        MOV R1, 0xFFFF
        CMP R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
    t.assert((sys.debug(Registers.RFL) >> Flags.NEGATIVE & 1) == 0, 'Negative flag not set');
  });

  t.test('CMP compares higher value', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x1234
        MOV R1, 0xFFFF
        CMP R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 0, 'Zero flag not set');
    t.assert((sys.debug(Registers.RFL) >> Flags.NEGATIVE & 1) == 1, 'Negative flag set');
  });

  t.test('CMP compares lower value', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0xFFFF
        MOV R1, 0x1234
        CMP R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.RFL) == 0, 'Flags not set');
  });
};