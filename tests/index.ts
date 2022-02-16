import {ArithmeticTests} from './arithmetic';
import {CallTests} from './call';
import {CommentsTests} from './comments';
import {CompareTests} from './compare';
import {CoreTests} from './core';
import {JumpTests} from './jump';
import {LogicTests} from './logic';
import {MemoryTests} from './memory';
import {ParserErrorTests} from './parser_error';

export const ALL_TESTS = [
  ArithmeticTests,
  CallTests,
  CommentsTests,
  CompareTests,
  CoreTests,
  JumpTests,
  LogicTests,
  MemoryTests,
  ParserErrorTests,
];