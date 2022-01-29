import {Registers, Result, System} from '../core';
import {TestRunner, TestSpec} from '../lib';
import {assembleAndBoot} from './helpers';

export const JumpTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('JMPI jumps to address', () => {
    const result = assembleAndBoot(sys, `
      JMPI 0x2007
      MOVI R0, 0xFFFF
      END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 not set');
  });
};