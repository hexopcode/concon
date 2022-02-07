import {Flags, Registers, Result, System} from '../core';
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
        MOV R0, 0xFFFF
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 not set');
  });

  t.test('JMP jumps to label', () => {
    const result = assembleAndBoot(sys, `
        JMP here
        MOV R0, 0xFFFF
      here:
        MOV R1, 0xFFFF
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 not set');
    t.assert(sys.debug(Registers.R1) == 0xFFFF, 'Register R1 contains result');
  });

  t.test('JMPR jumps to address', () => {
    const result = assembleAndBoot(sys, `
        MOV R1, 0x200A
        JMPR R1
        MOV R0, 0xFFFF
        END
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 not set');
  });

  t.test('JZ jumps if zero', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x1234
        SUBI R0, 0x1234
        JZ done
        MOV R0, 0x1111
      done:
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 not set');
  });

  t.test('JZ does not jump', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x1234
        SUBI R0, 0x1231
        JZ done
        MOV R0, 0x1111
      done:
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0x1111, 'Register R0 contains result');
  });

  t.test('JNZ jumps if not zero', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x1234
        SUBI R0, 0x1231
        JNZ done
        MOV R0, 0x1111
      done:
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 3, 'Register R0 contains result');
  });

  t.test('JNZ does not jump', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x1234
        SUBI R0, 0x1234
        JNZ done
        MOV R0, 0x1111
      done:
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0x1111, 'Register R0 contains result');
  });

  t.test('JG jumps if greater', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x1234
        CMPI R0, 0x1231
        JG done
        MOV R0, 0x1111
      done:
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0x1234, 'Register R0 contais result');
  });

  t.test('JG does not jump', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x1234
        CMPI R0, 0x1235
        JG done
        MOV R0, 0x1111
      done:
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0x1111, 'Register R0 contains result');
  });

  t.test('JGZ jumps if greater', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x1234
        CMPI R0, 0x1231
        JGZ done
        MOV R0, 0x1111
      done:
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0x1234, 'Register R0 not set');
  });

  t.test('JGZ jumps if zero', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x1234
        CMPI R0, 0x1234
        JGZ done
        MOV R0, 0x1111
      done:
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0x1234, 'Register R0 not set');
  });

  t.test('JGZ does not jump', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x1234
        CMPI R0, 0x1236
        JGZ done
        MOV R0, 0x1111
      done:
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0x1111, 'Register R0 contains result');
  });

  t.test('JL jumps if lower', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x1234
        CMPI R0, 0x1235
        JL done
        MOV R0, 0x1111
      done:
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0x1234, 'Register R0 not set');
  });

  t.test('JL does not jump', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x1234
        CMPI R0, 0x1233
        JL done
        MOV R0, 0x1111
      done:
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0x1111, 'Register R0 contains result');
  });

  t.test('JLZ jumps if lower', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x1234
        CMPI R0, 0x1235
        JLZ done
        MOV R0, 0x1111
      done:
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0x1234, 'Register R0 not set');
  });

  t.test('JLZ jumps if zero', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x1234
        CMPI R0, 0x1234
        JLZ done
        MOV R0, 0x1111
      done:
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0x1234, 'Register R0 not set');
  });

  t.test('JL does not jump', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x1234
        CMPI R0, 0x1233
        JLZ done
        MOV R0, 0x1111
      done:
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0x1111, 'Register R0 contains result');
  });

  t.test('JO jumps on overflow', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0xFFFF
        ADDI R0, 1
        JO done
        MOV R0, 0x1111
      done:
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0xFFFF, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.OVERFLOW & 1) == 1, 'Overflow flag is set');
  });

  t.test('JO does not jump', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0xFFFE
        ADDI R0, 1
        JO done
        MOV R0, 0x1111
      done:
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0x1111, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.OVERFLOW & 1) == 0, 'Overflow flag not set');
  });

  t.test('JDZ jump on divbyzero', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0xFFFF
        DIVI R0, 0
        JDZ done
        MOV R0, 0x1111
      done:
        END
    `);

    t.assert(sys.debug(Registers.R0) == 0xFFFF, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.DIVBYZERO & 1) == 1, 'Divbyzero flag is set');
  });

  t.test('JDZ does not jump', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0xFFFF
        DIVI R0, 1
        JDZ done
        MOV R0, 0x1111
      done:
        END
    `);

    t.assert(sys.debug(Registers.R0) == 0x1111, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.DIVBYZERO & 1) == 0, 'Divbyzero flag not set');
  });
};