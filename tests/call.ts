import {Registers, Result, System} from '../src/core';
import {TestRunner, TestSpec} from '../src/lib';
import {assembleAndBoot} from './helpers';

export const CallTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('push pop work', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0x1234
        push r0
        pop r1
        end
    `);
    t.assert(result == Result.END, 'ends');
    t.assert(sys.debug(Registers.R0) == 0x1234, 'R0 is set');
    t.assert(sys.debug(Registers.R1) == 0x1234, 'R1 is set');
  });

  t.test('pushall popall work', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0x1234
        mov r1, 0x2345
        mov r2, 0x3456
        mov r13, 0xdddd
        mov r14, 0xeeee
        mov r15, 0xffff
        
        pushall

        mov r0, 0
        mov r1, 0
        mov r2, 0
        mov r13, 0
        mov r14, 0
        mov r15, 0

        popall

        end
    `);
    t.assert(result == Result.END, 'ends');
    t.assert(sys.debug(Registers.R0) == 0x1234, 'R0 is set');
    t.assert(sys.debug(Registers.R1) == 0x2345, 'R1 is set');
    t.assert(sys.debug(Registers.R2) == 0x3456, 'R2 is set');
    t.assert(sys.debug(Registers.R13) == 0xdddd, 'R0 is set');
    t.assert(sys.debug(Registers.R14) == 0xeeee, 'R0 is set');
    t.assert(sys.debug(Registers.R15) == 0xffff, 'R0 is set');
  });
}