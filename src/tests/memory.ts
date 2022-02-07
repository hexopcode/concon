import {assembleCheck} from '../asm';
import {Registers, Result, System} from '../core';
import {TestRunner, TestSpec} from '../lib';
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

  t.test('register RIP cannot be set', () => {
    const errors = assembleCheck(`MOV RIP, 1234`);

    t.assert(errors.length == 1, 'Has assembly error');
    t.assert(errors[0].message == 'Cannot set value for register RIP', 'Message mentions RIP');
  });

  t.test('register RFL cannot be set', () => {
    const errors = assembleCheck(`MOV RFL, 1234`);

    t.assert(errors.length == 1, 'Has assembly error');
    t.assert(errors[0].message == 'Cannot set value for register RFL', 'Message mentions RFL');
  });

  t.test('register RIN cannot be set', () => {
    const errors = assembleCheck(`MOV RIN, 1234`);

    t.assert(errors.length == 1, 'Has assembly error');
    t.assert(errors[0].message == 'Cannot set value for register RIN', 'Message mentions RIN');
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

  t.test('STOI sets memory with immediate', () => {
    const result = assembleAndBoot(sys, `
        STOI 0x3000, 0x1234
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debugMem(0x3000, 1)[0] == 0x12, 'Mem is set');
    t.assert(sys.debugMem(0x3001, 1)[0] == 0x34, 'Mem is set');
  });

  t.test('STOIB sets memory with immediate', () => {
    const result = assembleAndBoot(sys, `
        STOIB 0x3000, 0x1234
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debugMem(0x3000, 1)[0] == 0x34, 'Mem is set');
    t.assert(sys.debugMem(0x3001, 1)[0] == 0x00, 'Mem is set');
  });

  t.test('STORI sets memory at register with immediate', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x3000
        STORI R0, 0x1234
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debugMem(0x3000, 1)[0] == 0x12, 'Mem is set');
    t.assert(sys.debugMem(0x3001, 1)[0] == 0x34, 'Mem is set');
  });

  t.test('STORIB sets memory at register with immediate', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x3000
        STORIB R0, 0x1234
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debugMem(0x3000, 1)[0] == 0x34, 'Mem is set');
    t.assert(sys.debugMem(0x3001, 1)[0] == 0x00, 'Mem is set');
  });

  t.test('STOR sets memory memory with register value', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x1234
        STOR 0x3000, R0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debugMem(0x3000, 1)[0] == 0x12, 'Mem is set');
    t.assert(sys.debugMem(0x3001, 1)[0] == 0x34, 'Mem is set');
  });

  t.test('STORB sets memory memory with register value', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x1234
        STORB 0x3000, R0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debugMem(0x3000, 1)[0] == 0x34, 'Mem is set');
    t.assert(sys.debugMem(0x3001, 1)[0] == 0x00, 'Mem is set');
  });

  t.test('STORR sets memory at register with register value', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x3000
        MOV R1, 0x1234
        STORR R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debugMem(0x3000, 1)[0] == 0x12, 'Mem is set');
    t.assert(sys.debugMem(0x3001, 1)[0] == 0x34, 'Mem is set');
  });

  t.test('STORRB sets memory at register with register value', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x3000
        MOV R1, 0x1234
        STORRB R0, R1
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debugMem(0x3000, 1)[0] == 0x34, 'Mem is set');
    t.assert(sys.debugMem(0x3001, 1)[0] == 0x00, 'Mem is set');
  });

  t.test('LODR reads memory at address into register', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x1234
        STOR 0x3000, R0
        LODR R1, 0x3000
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R1) == 0x1234, 'Register is set');
  });

  t.test('LODRB reads memory at address into register', () => {
    const result = assembleAndBoot(sys, `
        MOV R0, 0x1234
        STOR 0x3000, R0
        LODRB R1, 0x3000
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R1) == 0x12, 'Register is set');
  });

  t.test('LODRR reads memory at address from register into register', () => {
    const result = assembleAndBoot(sys, `
        STOI 0x3000, 0x1234
        MOV R0, 0x3000
        LODRR R1, R0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R1) == 0x1234, 'Register is set');
  });

  t.test('LODRRB reads memory at address from register into register', () => {
    const result = assembleAndBoot(sys, `
        STOI 0x3000, 0x1234
        MOV R0, 0x3000
        LODRRB R1, R0
        END
    `);
    t.assert(result == Result.END, 'Program runs');

    t.assert(sys.debug(Registers.R1) == 0x12, 'Register is set');
  });
};