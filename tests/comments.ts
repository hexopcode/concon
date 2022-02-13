import {Registers, Result, System} from '../src/core';
import {TestRunner, TestSpec} from '../src/lib';
import {assembleAndBoot} from './helpers';

export const CommentsTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('Single line comment comments', () => {
    const result = assembleAndBoot(sys, `
      mov r0, 0x1234
      // mov r0, 0xFFFF
      end
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 0x1234, 'Register R0 has value');
  });

  t.test('Multi-line comment comments', () => {
    const result = assembleAndBoot(sys, `
      mov r0, 0x1234
      /* mov r0, 0xFFFF */
      end
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 0x1234, 'Register R0 has value');
  });

  t.test('Multi-line comment comments multiple lines', () => {
    const result = assembleAndBoot(sys, `
      mov r0, 0x1234
      /* mov r0, 0xFFFF
      mov r0, 0x4444
      */
      end
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 0x1234, 'Register R0 has value');
  });
};