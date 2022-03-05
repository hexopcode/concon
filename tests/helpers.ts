import {assemble, assembleCheck as check} from '../src/asm';
import {AsmError} from '../src/asm/base';
import {StaticSourceResolver} from '../src/lib/source';
import {Result, System} from '../src/core';

export function assembleAndBoot(sys: System, source: string): Result {
  const resolver = new StaticSourceResolver();
  const entrypoint = 'entrypoint.con';
  resolver.add(entrypoint, source);
  sys.loadProgram(assemble(resolver, entrypoint));
  return sys.boot();
}

export function assembleCheck(source: string): AsmError[] {
  const resolver = new StaticSourceResolver();
  const entrypoint = 'entrypoint.con';
  resolver.add(entrypoint, source);
  return check(resolver, entrypoint);
}