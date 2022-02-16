import {Registers, Result, System} from '../src/core';
import {TestRunner, TestSpec} from '../src/lib';
import {assembleAndBoot} from './helpers';

export const CallTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('push pop work', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0x1234
        push r0
        pop r1
        end
    `)).is(Result.END);
    t.assertThat(sys.debug(Registers.R0)).is(0x1234);
    t.assertThat(sys.debug(Registers.R1)).is(0x1234);
  });

  t.test('pushall popall work', () => {
    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0x1234
        mov r1, 0x2345
        mov r2, 0x3456
        mov r13, 0xdddd
        mov r14, 0xeeee
        mov r15, 0xffff
        
        pushall

        mov r0, 0
        mov r1, 0
        mov r2, 0
        mov r13, 0
        mov r14, 0
        mov r15, 0

        popall

        end
    `)).is(Result.END);
    t.assertThat(sys.debug(Registers.R0)).is(0x1234);
    t.assertThat(sys.debug(Registers.R1)).is(0x2345);
    t.assertThat(sys.debug(Registers.R2)).is(0x3456);
    t.assertThat(sys.debug(Registers.R13)).is(0xdddd);
    t.assertThat(sys.debug(Registers.R14)).is(0xeeee);
    t.assertThat(sys.debug(Registers.R15)).is(0xffff);
  });
}