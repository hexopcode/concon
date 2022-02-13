import {Flags, Registers, Result, System} from '../src/core';
import {TestRunner, TestSpec} from '../src/lib';
import {assembleAndBoot} from './helpers';

export const JumpTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('jmp jumps to address', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0
        jmp 0x2015
        mov r0, 0xFFFF
        end
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 not set');
  });

  t.test('jmp jumps to label', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0
        jmp here
        mov r0, 0xFFFF
      here:
        mov r1, 0xFFFF
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 not set');
    t.assert(sys.debug(Registers.R1) == 0xFFFF, 'Register R1 contains result');
  });

  t.test('jmp jumps to address', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0
        mov r1, 0x2018
        jmp r1
        mov r0, 0xFFFF
        end
    `);
    t.assert(result == Result.END, 'Program runs');
    
    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 not set');
  });

  t.test('jz jumps if zero', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0x1234
        sub r0, 0x1234
        jz done
        mov r0, 0x1111
      done:
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0, 'Register R0 not set');
  });

  t.test('jz does not jump', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0x1234
        sub r0, 0x1231
        jz done
        mov r0, 0x1111
      done:
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0x1111, 'Register R0 contains result');
  });

  t.test('jnz jumps if not zero', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0x1234
        sub r0, 0x1231
        jnz done
        mov r0, 0x1111
      done:
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 3, 'Register R0 contains result');
  });

  t.test('jnz does not jump', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0x1234
        sub r0, 0x1234
        jnz done
        mov r0, 0x1111
      done:
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0x1111, 'Register R0 contains result');
  });

  t.test('jg jumps if greater', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0x1234
        cmp r0, 0x1231
        jg done
        mov r0, 0x1111
      done:
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0x1234, 'Register R0 contais result');
  });

  t.test('jg does not jump', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0x1234
        cmp r0, 0x1235
        jg done
        mov r0, 0x1111
      done:
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0x1111, 'Register R0 contains result');
  });

  t.test('jgz jumps if greater', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0x1234
        cmp r0, 0x1231
        jgz done
        mov r0, 0x1111
      done:
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0x1234, 'Register R0 not set');
  });

  t.test('jgz jumps if zero', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0x1234
        cmp r0, 0x1234
        jgz done
        mov r0, 0x1111
      done:
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0x1234, 'Register R0 not set');
  });

  t.test('jgz does not jump', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0x1234
        cmp r0, 0x1236
        jgz done
        mov r0, 0x1111
      done:
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0x1111, 'Register R0 contains result');
  });

  t.test('jl jumps if lower', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0x1234
        cmp r0, 0x1235
        jl done
        mov r0, 0x1111
      done:
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0x1234, 'Register R0 not set');
  });

  t.test('jl does not jump', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0x1234
        cmp r0, 0x1233
        jl done
        mov r0, 0x1111
      done:
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0x1111, 'Register R0 contains result');
  });

  t.test('jlz jumps if lower', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0x1234
        cmp r0, 0x1235
        jlz done
        mov r0, 0x1111
      done:
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0x1234, 'Register R0 not set');
  });

  t.test('jlz jumps if zero', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0x1234
        cmp r0, 0x1234
        jlz done
        mov r0, 0x1111
      done:
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0x1234, 'Register R0 not set');
  });

  t.test('jl does not jump', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0x1234
        cmp r0, 0x1233
        jlz done
        mov r0, 0x1111
      done:
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0x1111, 'Register R0 contains result');
  });

  t.test('jo jumps on overflow', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0xFFFF
        add r0, 1
        jo done
        mov r0, 0x1111
      done:
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0xFFFF, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.OVERFLOW & 1) == 1, 'Overflow flag is set');
  });

  t.test('jo does not jump', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0xFFFE
        add r0, 1
        jo done
        mov r0, 0x1111
      done:
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 0x1111, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.OVERFLOW & 1) == 0, 'Overflow flag not set');
  });

  t.test('jdz jump on divbyzero', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0xFFFF
        div r0, 0
        jdz done
        mov r0, 0x1111
      done:
        end
    `);

    t.assert(sys.debug(Registers.R0) == 0xFFFF, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.DIVBYZERO & 1) == 1, 'Divbyzero flag is set');
  });

  t.test('jdz does not jump', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0xFFFF
        div r0, 1
        jdz done
        mov r0, 0x1111
      done:
        end
    `);

    t.assert(sys.debug(Registers.R0) == 0x1111, 'Register R0 contains result');
    t.assert((sys.debug(Registers.RFL) >> Flags.DIVBYZERO & 1) == 0, 'Divbyzero flag not set');
  });
};