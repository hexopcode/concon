import {Registers, Result, System} from '../src/core';
import {TestRunner, TestSpec, assembleAndBoot} from '../src/lib/testing';

export const CommentsTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('Single line comment comments', () => {
    t.assertThat(assembleAndBoot(sys, `
      mov r0, 0x1234
      // mov r0, 0xFFFF
      end
    `)).is(Result.END);
    
    t.assertThat(sys.debug(Registers.R0)).is(0x1234);
  });

  t.test('Multi-line comment comments', () => {
    t.assertThat(assembleAndBoot(sys, `
      mov r0, 0x1234
      /* mov r0, 0xFFFF */
      end
    `)).is(Result.END);
    
    t.assertThat(sys.debug(Registers.R0)).is(0x1234);
  });

  t.test('Multi-line comment comments multiple lines', () => {
    t.assertThat(assembleAndBoot(sys, `
      mov r0, 0x1234
      /* mov r0, 0xFFFF
      mov r0, 0x4444
      */
      end
    `)).is(Result.END);
    
    t.assertThat(sys.debug(Registers.R0)).is(0x1234);
  });

  t.test('Multi-line comment variant', () => {
    t.assertThat(assembleAndBoot(sys, `
      /**
       * this is a comment
       */

      /**** another ** comment */

      mov r0, 0x1234
      end
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0x1234);
  });
};