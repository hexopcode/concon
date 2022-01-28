import {assemble} from '../asm';
import {Registers, Result, System} from '../core';
import {TestRunner, TestSpec} from '../lib';

export const MemoryTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  function assembleAndRun(source: string) {
    sys.loadProgram(assemble(source));
    sys.boot();
  }

  t.after(() => {
    sys.reset();
  });

  t.test('movi', () => {
    assembleAndRun(`
        MOVI R0, 1234
        MOVI R1, 0b1111
        MOVI R2, 0o777
        MOVI R3, 0x1234
        END
    `);
    t.assert(sys.cycle() == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 1234, 'R0 is set to decimal value');
    t.assert(sys.debug(Registers.R1) == 0b1111, 'R1 is set to binary value');
    t.assert(sys.debug(Registers.R2) == 0o777, 'R2 is set to octal value');
    t.assert(sys.debug(Registers.R3) == 0x1234, 'R3 is set to hexadecimal value');
  });

  t.test('registers R10..R15 parsed correctly', () => {
    assembleAndRun(`
        MOVI R10, 10
        MOVI R11, 11
        MOVI R12, 12
        MOVI R13, 13
        MOVI R14, 14
        MOVI R15, 15
        END
    `);
    t.assert(sys.cycle() == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R10) == 10, 'R10 set');
    t.assert(sys.debug(Registers.R11) == 11, 'R11 set');
    t.assert(sys.debug(Registers.R12) == 12, 'R12 set');
    t.assert(sys.debug(Registers.R13) == 13, 'R13 set');
    t.assert(sys.debug(Registers.R14) == 14, 'R14 set');
    t.assert(sys.debug(Registers.R15) == 15, 'R15 set');
  })
};