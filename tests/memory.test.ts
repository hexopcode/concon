import {Registers, Result, System} from '../src/core';
import {TestRunner, TestSpec, assembleAndBoot} from '../src/lib/testing';

export const MemoryTests: TestSpec = (t: TestRunner) => {
  const sys = new System(true);

  t.before(() => {
    sys.reset();
  });

  t.test('mov instruction sets general registers', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 1234
        mov r1, 0b1111
        mov r2, 0o777
        mov r3, 0x1234
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(1234);
    t.assertThat(sys.debug(Registers.R1)).is(0b1111);
    t.assertThat(sys.debug(Registers.R2)).is(0o777);
    t.assertThat(sys.debug(Registers.R3)).is(0x1234);
  });

  t.test('registers R10..R15 parsed correctly', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r10, 10
        mov r11, 11
        mov r12, 12
        mov r13, 13
        mov r14, 14
        mov r15, 15
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R10)).is(10);
    t.assertThat(sys.debug(Registers.R11)).is(11);
    t.assertThat(sys.debug(Registers.R12)).is(12);
    t.assertThat(sys.debug(Registers.R13)).is(13);
    t.assertThat(sys.debug(Registers.R14)).is(14);
    t.assertThat(sys.debug(Registers.R15)).is(15);
  });

  t.test('mov instruction sets register RSP', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov rsp, 1234
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.RSP)).is(1234);
  });

  t.test('mov sets register value from another register', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 1234
        mov r1, r0
        mov r0, 4567
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(4567);
    t.assertThat(sys.debug(Registers.R1)).is(1234);
  });

  t.test('sto sets memory with immediate', () => {
    t.assertThat(assembleAndBoot(sys, `
        sto 0x3000, 0x1234
        end
    `)).is(Result.END);

    t.assertThat(sys.debugMem(0x3000, 1)[0]).is(0x12);
    t.assertThat(sys.debugMem(0x3001, 1)[0]).is(0x34);
  });

  t.test('stob sets memory with immediate', () => {
    t.assertThat(assembleAndBoot(sys, `
        stob 0x3000, 0x1234
        end
    `)).is(Result.END);

    t.assertThat(sys.debugMem(0x3000, 1)[0]).is(0x34);
    t.assertThat(sys.debugMem(0x3001, 1)[0]).is(0x00);
  });

  t.test('sto sets memory at register with immediate', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0x3000
        sto r0, 0x1234
        end
    `)).is(Result.END);

    t.assertThat(sys.debugMem(0x3000, 1)[0]).is(0x12);
    t.assertThat(sys.debugMem(0x3001, 1)[0]).is(0x34);
  });

  t.test('stob sets memory at register with immediate', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0x3000
        stob r0, 0x1234
        end
    `)).is(Result.END);

    t.assertThat(sys.debugMem(0x3000, 1)[0]).is(0x34);
    t.assertThat(sys.debugMem(0x3001, 1)[0]).is(0x00);
  });

  t.test('sto sets memory memory with register value', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0x1234
        sto 0x3000, r0
        end
    `)).is(Result.END);

    t.assertThat(sys.debugMem(0x3000, 1)[0]).is(0x12);
    t.assertThat(sys.debugMem(0x3001, 1)[0]).is(0x34);
  });

  t.test('stob sets memory memory with register value', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0x1234
        stob 0x3000, r0
        end
    `)).is(Result.END);

    t.assertThat(sys.debugMem(0x3000, 1)[0]).is(0x34);
    t.assertThat(sys.debugMem(0x3001, 1)[0]).is(0x00);
  });

  t.test('sto sets memory at register with register value', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0x3000
        mov r1, 0x1234
        sto r0, r1
        end
    `)).is(Result.END);

    t.assertThat(sys.debugMem(0x3000, 1)[0]).is(0x12);
    t.assertThat(sys.debugMem(0x3001, 1)[0]).is(0x34);
  });

  t.test('stob sets memory at register with register value', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0x3000
        mov r1, 0x1234
        stob r0, r1
        end
    `)).is(Result.END);

    t.assertThat(sys.debugMem(0x3000, 1)[0]).is(0x34);
    t.assertThat(sys.debugMem(0x3001, 1)[0]).is(0x00);
  });

  t.test('lod reads memory at address into register', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0x1234
        sto 0x3000, r0
        lod r1, 0x3000
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R1)).is(0x1234);
  });

  t.test('lodb reads memory at address into register', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0x1234
        sto 0x3000, r0
        lodb r1, 0x3000
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R1)).is(0x12);
  });

  t.test('lod reads memory at address from register into register', () => {
    t.assertThat(assembleAndBoot(sys, `
        sto 0x3000, 0x1234
        mov r0, 0x3000
        lod r1, r0
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R1)).is(0x1234);
  });

  t.test('lodb reads memory at address from register into register', () => {
    t.assertThat(assembleAndBoot(sys, `
        sto 0x3000, 0x1234
        mov r0, 0x3000
        lodb r1, r0
        end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R1)).is(0x12);
  });
};