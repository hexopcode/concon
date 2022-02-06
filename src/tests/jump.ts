import {Registers, Result, System} from '../core';
import {TestRunner, TestSpec} from '../lib';
import {assembleAndBoot} from './helpers';

export const JumpTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('JMP jumps to address', () => {
    const result = assembleAndBoot(sys, `
        JMP 0x2007
        MOVI R0, 0xFFFF
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 not set');
  });

  t.test('JMP jumps to label', () => {
    const result = assembleAndBoot(sys, `
        JMP here
        MOVI R0, 0xFFFF
      here:
        MOVI R1, 0xFFFF
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 not set');
    t.assert(sys.debug(Registers.R1) == 0xFFFF, 'Register R1 contains result');
  });
};