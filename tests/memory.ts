import {Registers, Result, System} from '../src/core';
import {TestRunner, TestSpec} from '../src/lib';
import {assembleAndBoot} from './helpers';

export const MemoryTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('mov instruction sets general registers', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 1234
        mov r1, 0b1111
        mov r2, 0o777
        mov r3, 0x1234
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 1234, 'R0 is set to decimal value');
    t.assert(sys.debug(Registers.R1) == 0b1111, 'R1 is set to binary value');
    t.assert(sys.debug(Registers.R2) == 0o777, 'R2 is set to octal value');
    t.assert(sys.debug(Registers.R3) == 0x1234, 'R3 is set to hexadecimal value');
  });

  t.test('registers R10..R15 parsed correctly', () => {
    const result = assembleAndBoot(sys, `
        mov r10, 10
        mov r11, 11
        mov r12, 12
        mov r13, 13
        mov r14, 14
        mov r15, 15
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R10) == 10, 'R10 set');
    t.assert(sys.debug(Registers.R11) == 11, 'R11 set');
    t.assert(sys.debug(Registers.R12) == 12, 'R12 set');
    t.assert(sys.debug(Registers.R13) == 13, 'R13 set');
    t.assert(sys.debug(Registers.R14) == 14, 'R14 set');
    t.assert(sys.debug(Registers.R15) == 15, 'R15 set');
  });

  t.test('mov instruction sets register RSP', () => {
    const result = assembleAndBoot(sys, `
        mov rsp, 1234
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.RSP) == 1234, 'rsp set');
  });

  t.test('mov sets register value from another register', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 1234
        mov r1, r0
        mov r0, 4567
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 4567, 'R0 set');
    t.assert(sys.debug(Registers.R1) == 1234, 'R1 set');
  });

  t.test('sto sets memory with immediate', () => {
    const result = assembleAndBoot(sys, `
        sto 0x3000, 0x1234
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debugMem(0x3000, 1)[0] == 0x12, 'Mem is set');
    t.assert(sys.debugMem(0x3001, 1)[0] == 0x34, 'Mem is set');
  });

  t.test('stob sets memory with immediate', () => {
    const result = assembleAndBoot(sys, `
        stob 0x3000, 0x1234
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debugMem(0x3000, 1)[0] == 0x34, 'Mem is set');
    t.assert(sys.debugMem(0x3001, 1)[0] == 0x00, 'Mem is set');
  });

  t.test('sto sets memory at register with immediate', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0x3000
        sto r0, 0x1234
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debugMem(0x3000, 1)[0] == 0x12, 'Mem is set');
    t.assert(sys.debugMem(0x3001, 1)[0] == 0x34, 'Mem is set');
  });

  t.test('stob sets memory at register with immediate', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0x3000
        stob r0, 0x1234
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debugMem(0x3000, 1)[0] == 0x34, 'Mem is set');
    t.assert(sys.debugMem(0x3001, 1)[0] == 0x00, 'Mem is set');
  });

  t.test('sto sets memory memory with register value', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0x1234
        sto 0x3000, r0
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debugMem(0x3000, 1)[0] == 0x12, 'Mem is set');
    t.assert(sys.debugMem(0x3001, 1)[0] == 0x34, 'Mem is set');
  });

  t.test('stob sets memory memory with register value', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0x1234
        stob 0x3000, r0
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debugMem(0x3000, 1)[0] == 0x34, 'Mem is set');
    t.assert(sys.debugMem(0x3001, 1)[0] == 0x00, 'Mem is set');
  });

  t.test('sto sets memory at register with register value', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0x3000
        mov r1, 0x1234
        sto r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debugMem(0x3000, 1)[0] == 0x12, 'Mem is set');
    t.assert(sys.debugMem(0x3001, 1)[0] == 0x34, 'Mem is set');
  });

  t.test('stob sets memory at register with register value', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0x3000
        mov r1, 0x1234
        stob r0, r1
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debugMem(0x3000, 1)[0] == 0x34, 'Mem is set');
    t.assert(sys.debugMem(0x3001, 1)[0] == 0x00, 'Mem is set');
  });

  t.test('lod reads memory at address into register', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0x1234
        sto 0x3000, r0
        lod r1, 0x3000
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R1) == 0x1234, 'Register is set');
  });

  t.test('lodb reads memory at address into register', () => {
    const result = assembleAndBoot(sys, `
        mov r0, 0x1234
        sto 0x3000, r0
        lodb r1, 0x3000
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R1) == 0x12, 'Register is set');
  });

  t.test('lod reads memory at address from register into register', () => {
    const result = assembleAndBoot(sys, `
        sto 0x3000, 0x1234
        mov r0, 0x3000
        lod r1, r0
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R1) == 0x1234, 'Register is set');
  });

  t.test('lodb reads memory at address from register into register', () => {
    const result = assembleAndBoot(sys, `
        sto 0x3000, 0x1234
        mov r0, 0x3000
        lodb r1, r0
        end
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R1) == 0x12, 'Register is set');
  });
};