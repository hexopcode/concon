import {Registers, Result, System} from '../src/core';
import {TestRunner, TestSpec, assembleAndBoot} from '../src/lib/testing';

export const DataTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('data byte', () => {
    t.assertThat(assembleAndBoot(sys, `
        lodb r0, foo
        end
    
    foo: db 0xff
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0xff);
  });

  t.test('data word', () => {
    t.assertThat(assembleAndBoot(sys, `
        lod r0, foo
        end
    
    foo: dw 0xffff
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is(0xffff);
  });

  t.test('data word', () => {
    t.assertThat(assembleAndBoot(sys, `
        lod r0, foo
        end
    
    foo: dstr "hello world"
    `)).is(Result.END);

    t.assertThat(sys.debug(Registers.R0)).is('hello world'.length);
  });
}