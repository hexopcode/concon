import {Registers, Result, System} from '../core';
import {TestRunner, TestSpec} from '../lib';
import {assembleAndBoot} from './helpers';

export const CommentsTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('Single line comment comments', () => {
    const result = assembleAndBoot(sys, `
      MOV R0, 0x1234
      // MOV R0, 0xFFFF
      END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 0x1234, 'Register R0 has value');
  });

  t.test('Multi-line comment comments', () => {
    const result = assembleAndBoot(sys, `
      MOV R0, 0x1234
      /* MOV R0, 0xFFFF */
      END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 0x1234, 'Register R0 has value');
  });

  t.test('Multi-line comment comments multiple lines', () => {
    const result = assembleAndBoot(sys, `
      MOV R0, 0x1234
      /* MOV R0, 0xFFFF
      MOV R0, 0x4444
      */
      END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 0x1234, 'Register R0 has value');
  });
};