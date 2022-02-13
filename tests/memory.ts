import {Registers, Result, System} from '../src/core';
import {TestRunner, TestSpec} from '../src/lib';
import {assembleAndBoot} from './helpers';

export const MemoryTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('MOV instruction sets general registers', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 1234
        MOV R1, 0b1111
        MOV R2, 0o777
        MOV R3, 0x1234
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 1234, 'R0 is set to decimal value');
    t.assert(sys.debug(Registers.R1) == 0b1111, 'R1 is set to binary value');
    t.assert(sys.debug(Registers.R2) == 0o777, 'R2 is set to octal value');
    t.assert(sys.debug(Registers.R3) == 0x1234, 'R3 is set to hexadecimal value');
  });

  t.test('registers R10..R15 parsed correctly', () => {
    const result = assembleAndBoot(sys, `
        MOV R10, 10
        MOV R11, 11
        MOV R12, 12
        MOV R13, 13
        MOV R14, 14
        MOV R15, 15
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R10) == 10, 'R10 set');
    t.assert(sys.debug(Registers.R11) == 11, 'R11 set');
    t.assert(sys.debug(Registers.R12) == 12, 'R12 set');
    t.assert(sys.debug(Registers.R13) == 13, 'R13 set');
    t.assert(sys.debug(Registers.R14) == 14, 'R14 set');
    t.assert(sys.debug(Registers.R15) == 15, 'R15 set');
  });

  t.test('MOV instruction sets register RSP', () => {
    const result = assembleAndBoot(sys, `
        MOV RSP, 1234
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.RSP) == 1234, 'RSP set');
  });

  t.test('MOV sets register value from another register', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 1234
        MOV R1, R0
        MOV R0, 4567
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R0) == 4567, 'R0 set');
    t.assert(sys.debug(Registers.R1) == 1234, 'R1 set');
  });

  t.test('STO sets memory with immediate', () => {
    const result = assembleAndBoot(sys, `
        STO 0x3000, 0x1234
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debugMem(0x3000, 1)[0] == 0x12, 'Mem is set');
    t.assert(sys.debugMem(0x3001, 1)[0] == 0x34, 'Mem is set');
  });

  t.test('STOB sets memory with immediate', () => {
    const result = assembleAndBoot(sys, `
        STOB 0x3000, 0x1234
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debugMem(0x3000, 1)[0] == 0x34, 'Mem is set');
    t.assert(sys.debugMem(0x3001, 1)[0] == 0x00, 'Mem is set');
  });

  t.test('STO sets memory at register with immediate', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x3000
        STO R0, 0x1234
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debugMem(0x3000, 1)[0] == 0x12, 'Mem is set');
    t.assert(sys.debugMem(0x3001, 1)[0] == 0x34, 'Mem is set');
  });

  t.test('STOB sets memory at register with immediate', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x3000
        STOB R0, 0x1234
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debugMem(0x3000, 1)[0] == 0x34, 'Mem is set');
    t.assert(sys.debugMem(0x3001, 1)[0] == 0x00, 'Mem is set');
  });

  t.test('STO sets memory memory with register value', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x1234
        STO 0x3000, R0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debugMem(0x3000, 1)[0] == 0x12, 'Mem is set');
    t.assert(sys.debugMem(0x3001, 1)[0] == 0x34, 'Mem is set');
  });

  t.test('STOB sets memory memory with register value', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x1234
        STOB 0x3000, R0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debugMem(0x3000, 1)[0] == 0x34, 'Mem is set');
    t.assert(sys.debugMem(0x3001, 1)[0] == 0x00, 'Mem is set');
  });

  t.test('STO sets memory at register with register value', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x3000
        MOV R1, 0x1234
        STO R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debugMem(0x3000, 1)[0] == 0x12, 'Mem is set');
    t.assert(sys.debugMem(0x3001, 1)[0] == 0x34, 'Mem is set');
  });

  t.test('STOB sets memory at register with register value', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x3000
        MOV R1, 0x1234
        STOB R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debugMem(0x3000, 1)[0] == 0x34, 'Mem is set');
    t.assert(sys.debugMem(0x3001, 1)[0] == 0x00, 'Mem is set');
  });

  t.test('LOD reads memory at address into register', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x1234
        STO 0x3000, R0
        LOD R1, 0x3000
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R1) == 0x1234, 'Register is set');
  });

  t.test('LODB reads memory at address into register', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x1234
        STO 0x3000, R0
        LODB R1, 0x3000
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R1) == 0x12, 'Register is set');
  });

  t.test('LOD reads memory at address from register into register', () => {
    const result = assembleAndBoot(sys, `
        STO 0x3000, 0x1234
        MOV R0, 0x3000
        LOD R1, R0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R1) == 0x1234, 'Register is set');
  });

  t.test('LODB reads memory at address from register into register', () => {
    const result = assembleAndBoot(sys, `
        STO 0x3000, 0x1234
        MOV R0, 0x3000
        LODB R1, R0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R1) == 0x12, 'Register is set');
  });
};