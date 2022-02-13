import {Flags, Registers, Result, System} from '../src/core';
import {TestRunner, TestSpec} from '../src/lib';
import {assembleAndBoot} from './helpers';

export const CompareTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('cmp compares equals', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0xFFFF
        cmp r0, 0xFFFF
        end
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
    t.assert((sys.debug(Registers.RFL) >> Flags.NEGATIVE & 1) == 0, 'Negative flag not set');
  });

  t.test('cmp compares higher value', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0x1234
        cmp r0, 0xFFFF
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 0, 'Zero flag not set');
    t.assert((sys.debug(Registers.RFL) >> Flags.NEGATIVE & 1) == 1, 'Negative flag set');
  });

  t.test('cmp compares lower value', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0xFFFF
        cmp r0, 0x1234
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.RFL) == 0, 'Flags not set');
  });

  t.test('cmp compares equals', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0xFFFF
        mov r1, 0xFFFF
        cmp r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 1, 'Zero flag set');
    t.assert((sys.debug(Registers.RFL) >> Flags.NEGATIVE & 1) == 0, 'Negative flag not set');
  });

  t.test('cmp compares higher value', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0x1234
        mov r1, 0xFFFF
        cmp r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert((sys.debug(Registers.RFL) >> Flags.ZERO & 1) == 0, 'Zero flag not set');
    t.assert((sys.debug(Registers.RFL) >> Flags.NEGATIVE & 1) == 1, 'Negative flag set');
  });

  t.test('cmp compares lower value', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0xFFFF
        mov r1, 0x1234
        cmp r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.RFL) == 0, 'Flags not set');
  });
};