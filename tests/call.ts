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

  t.test('access stack after push', () => {
    t.assertThat(assembleAndBoot(sys, `
        push 0x1234
        mov r0, rsp
        sub r0, 2
        lod r0, r0
        end
    `)).is(Result.END);
    t.assertThat(sys.debug(Registers.R0)).is(0x1234);
  });

  t.test('proc defined and called', () => {
    t.assertThat(assembleAndBoot(sys, `
        proc foo:
          ret
        
        call foo
        end
    `)).is(Result.END);
  });

  t.test('proc with instructions called', () => {
    t.assertThat(assembleAndBoot(sys, `
        proc add1:
          inc r0
          ret
        
        mov r0, 1
        call add1
        end
    `)).is(Result.END);
    t.assertThat(sys.debug(Registers.R0)).is(2);
  });

  t.test('proc calls proc', () => {
    t.assertThat(assembleAndBoot(sys, `
        proc add1:
          inc r0
          ret
        
        proc mul2add1:
          mul r0, 2
          call add1
          ret
        
        mov r0, 1
        call mul2add1
        end
    `)).is(Result.END);
    t.assertThat(sys.debug(Registers.R0)).is(3);
  });

  t.test('proc and recursion', () => {
    t.assertThat(assembleAndBoot(sys, `
        proc foo:
          cmp r1, 0
          jz done

          inc r0
          dec r1
          call foo

        done:
          ret

        mov r0, 0
        mov r1, 4
        call foo
        mov r2, 0x1234
        end
    `)).is(Result.END);
    t.assertThat(sys.debug(Registers.R0)).is(4);
    t.assertThat(sys.debug(Registers.R1)).is(0);
    t.assertThat(sys.debug(Registers.R2)).is(0x1234);
  });

  t.test('proc and stack', () => {
    t.assertThat(assembleAndBoot(sys, `
        proc XminusY:
          // arg2
          mov r1, rsp
          sub r1, 6
          lod r1, r1

          // arg1
          mov r0, rsp
          sub r0, 4
          lod r0, r0

          sub r0, r1
          ret
        
        push 1001
        push 1004
        call XminusY
        sub rsp, 4
        end
    `)).is(Result.END);
    t.assertThat(sys.debug(Registers.R0)).is(3);
  });
}