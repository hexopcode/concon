import {assemble} from '../asm';
import {Registers, Result, System} from '../core';
import {TestRunner, TestSpec} from '../lib';

export const JumpTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  function assembleAndRun(source: string) {
    sys.loadProgram(assemble(source));
    sys.boot();
  }

  t.after(() => {
    sys.reset();
  });

  t.test('JMPI jumps to address', () => {
    assembleAndRun(`
      JMPI 0x2007
      MOVI R0, 0xFFFF
      END
    `);
    t.assert(sys.cycle() == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 not set');
  });
};