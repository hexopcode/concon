import {Flags, Registers, Result, System} from '../src/core';
import {TestRunner, TestSpec, assembleAndBoot} from '../src/lib/testing';

export const JumpTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('jmp jumps to address', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0
        jmp 0x2015
        mov r0, 0xFFFF
        end
    `)).is(Result.END);
    
    t.assertThat(sys.debug(Registers.R0)).is(0);
  });

  t.test('jmp jumps to label', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0
        jmp here
        mov r0, 0xFFFF
      here:
        mov r1, 0xFFFF
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0);
    t.assertThat(sys.debug(Registers.R1)).is(0xFFFF);
  });

  t.test('jmp jumps to address', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0
        mov r1, 0x2018
        jmp r1
        mov r0, 0xFFFF
        end
    `)).is(Result.END);
    
    t.assertThat(sys.debug(Registers.R0)).is(0);
  });

  t.test('jz jumps if zero', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0x1234
        sub r0, 0x1234
        jz done
        mov r0, 0x1111
      done:
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0);
  });

  t.test('jz does not jump', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0x1234
        sub r0, 0x1231
        jz done
        mov r0, 0x1111
      done:
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0x1111);
  });

  t.test('jnz jumps if not zero', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0x1234
        sub r0, 0x1231
        jnz done
        mov r0, 0x1111
      done:
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(3);
  });

  t.test('jnz does not jump', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0x1234
        sub r0, 0x1234
        jnz done
        mov r0, 0x1111
      done:
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0x1111);
  });

  t.test('jg jumps if greater', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0x1234
        cmp r0, 0x1231
        jg done
        mov r0, 0x1111
      done:
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0x1234);
  });

  t.test('jg does not jump', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0x1234
        cmp r0, 0x1235
        jg done
        mov r0, 0x1111
      done:
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0x1111);
  });

  t.test('jgz jumps if greater', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0x1234
        cmp r0, 0x1231
        jgz done
        mov r0, 0x1111
      done:
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0x1234);
  });

  t.test('jgz jumps if zero', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0x1234
        cmp r0, 0x1234
        jgz done
        mov r0, 0x1111
      done:
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0x1234);
  });

  t.test('jgz does not jump', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0x1234
        cmp r0, 0x1236
        jgz done
        mov r0, 0x1111
      done:
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0x1111);
  });

  t.test('jl jumps if lower', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0x1234
        cmp r0, 0x1235
        jl done
        mov r0, 0x1111
      done:
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0x1234);
  });

  t.test('jl does not jump', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0x1234
        cmp r0, 0x1233
        jl done
        mov r0, 0x1111
      done:
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0x1111);
  });

  t.test('jlz jumps if lower', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0x1234
        cmp r0, 0x1235
        jlz done
        mov r0, 0x1111
      done:
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0x1234);
  });

  t.test('jlz jumps if zero', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0x1234
        cmp r0, 0x1234
        jlz done
        mov r0, 0x1111
      done:
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0x1234);
  });

  t.test('jl does not jump', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0x1234
        cmp r0, 0x1233
        jlz done
        mov r0, 0x1111
      done:
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0x1111);
  });

  t.test('jo jumps on overflow', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0xFFFF
        add r0, 1
        jo done
        mov r0, 0x1111
      done:
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0xFFFF);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.OVERFLOW & 1)).is(1);
  });

  t.test('jo does not jump', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0xFFFE
        add r0, 1
        jo done
        mov r0, 0x1111
      done:
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0x1111);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.OVERFLOW & 1)).is(0);
  });

  t.test('jdz jump on divbyzero', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0xFFFF
        div r0, 0
        jdz done
        mov r0, 0x1111
      done:
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0xFFFF);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.DIVBYZERO & 1)).is(1);
  });

  t.test('jdz does not jump', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0xFFFF
        div r0, 1
        jdz done
        mov r0, 0x1111
      done:
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0x1111);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.DIVBYZERO & 1)).is(0);
  });
};