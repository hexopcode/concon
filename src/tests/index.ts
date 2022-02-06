import {ArithmeticTests} from './arithmetic';
import {CommentsTests} from './comments';
import {CompareTests} from './compare';
import {JumpTests} from './jump';
import {LogicTests} from './logic';
import {MemoryTests} from './memory';
import {ParserErrorTests} from './parser_error';

export const ALL_TESTS = [
  ArithmeticTests,
  CommentsTests,
  CompareTests,
  JumpTests,
  LogicTests,
  MemoryTests,
  ParserErrorTests,
];