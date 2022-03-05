import {assemble, assembleCheck as check} from '../../asm';
import {AsmError} from '../../asm/base';
import {StaticSourceResolver} from '../source';
import {Result, System} from '../../core';

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