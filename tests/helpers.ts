import {assemble } from '../src/asm';
import {Result, System} from '../src/core';

export function assembleAndBoot(sys: System, source: string): Result {
  sys.loadProgram(assemble(source));
  return sys.boot();
}