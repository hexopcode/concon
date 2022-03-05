import {assembleCheck} from './helpers';
import {System} from '../src/core';
import {TestRunner, TestSpec} from '../src/lib';

export const ParserErrorTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('parser fails with unknown identifier', () => {
    const errors = assembleCheck(`POTATO`);

    t.assertThat(errors.length).is(1);
    t.assertThat(errors[0].message).is('Invalid token: POTATO');
  });

  t.test('parser fails with incorrect operand', () => {
    const errors = assembleCheck(`inc 0x1234`);

    t.assertThat(errors.length).is(1);
    t.assertThat(errors[0].message).is('Invalid token: NUMBER. Expected register');
  });
};