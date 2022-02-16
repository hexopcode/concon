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
}