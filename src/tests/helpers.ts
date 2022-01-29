import {assemble } from '../asm';
import {Result, System} from '../core';

export function assembleAndBoot(sys: System, source: string): Result {
  sys.loadProgram(assemble(source));
  return sys.boot();
}