import {Flags, MAX_VALUE, Registers, Result, System} from '../src/core';
import {TestRunner, TestSpec, assembleAndBoot} from '../src/lib/testing';

export const LogicTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('shl shifts', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 1
        shl r0, 3
        end
    `)).is(Result.END);
    
    t.assertThat(sys.debug(Registers.R0)).is(8);
  });

  t.test('shl sets overflow flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0xFFFF
        shl r0, 1
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(MAX_VALUE);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.OVERFLOW & 1)).is(1);
  });

  t.test('shl shifts', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 1
        mov r1, 3
        shl r0, r1
        end
    `)).is(Result.END);
    
    t.assertThat(sys.debug(Registers.R0)).is(8);
  });

  t.test('shl sets overflow flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0xFFFF
        mov r1, 1
        shl r0, r1
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(MAX_VALUE);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.OVERFLOW & 1)).is(1);
  });

  t.test('shr shifts', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 8
        shr r0, 3
        end
    `)).is(Result.END);
    
    t.assertThat(sys.debug(Registers.R0)).is(1);
  });

  t.test('shr sets zero flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 1
        shr r0, 2
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.ZERO & 1)).is(1);
  });

  t.test('shr shifts', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 8
        mov r1, 3
        shr r0, r1
        end
    `)).is(Result.END);
    
    t.assertThat(sys.debug(Registers.R0)).is(1);
  });

  t.test('shr sets zero flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 1
        mov r1, 2
        shr r0, r1
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.ZERO & 1)).is(1);
  });

  t.test('or ors', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 8
        or r0, 3
        end
    `)).is(Result.END);
    
    t.assertThat(sys.debug(Registers.R0)).is(11);
  });

  t.test('or sets zero flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0
        or r0, 0
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.ZERO & 1)).is(1);
  });

  t.test('or ors', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 8
        mov r1, 3
        or r0, r1
        end
    `)).is(Result.END);
    
    t.assertThat(sys.debug(Registers.R0)).is(11);
  });

  t.test('or sets zero flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0
        mov r1, 0
        or r0, r1
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.ZERO & 1)).is(1);
  });

  t.test('and ands', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 8
        and r0, 9
        end
    `)).is(Result.END);
    
    t.assertThat(sys.debug(Registers.R0)).is(8);
  });

  t.test('and sets zero flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 8
        and r0, 0
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.ZERO & 1)).is(1);
  });

  t.test('and ands', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 8
        mov r1, 9
        and r0, r1
        end
    `)).is(Result.END);
    
    t.assertThat(sys.debug(Registers.R0)).is(8);
  });

  t.test('and sets zero flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 8
        mov r1, 0
        and r0, r1
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.ZERO & 1)).is(1);
  });

  t.test('xor xors', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0b101
        xor r0, 0b110
        end
    `)).is(Result.END);
    
    t.assertThat(sys.debug(Registers.R0)).is(0b011);
  });

  t.test('xor sets zero flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 8
        xor r0, 8
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.ZERO & 1)).is(1);
  });

  t.test('xor ands', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0b101
        mov r1, 0b110
        xor r0, r1
        end
    `)).is(Result.END);
    
    t.assertThat(sys.debug(Registers.R0)).is(0b011);
  });

  t.test('xor sets zero flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 8
        mov r1, 8
        xor r0, r1
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.ZERO & 1)).is(1);
  });

  t.test('not nots', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0xFF00
        not r0
        end
    `)).is(Result.END);
    
    t.assertThat(sys.debug(Registers.R0)).is(0x00FF);
  });

  t.test('not sets zero flag', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0xFFFF
        not r0
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0);
    t.assertThat((sys.debug(Registers.RFL) >> Flags.ZERO & 1)).is(1);
  });
};