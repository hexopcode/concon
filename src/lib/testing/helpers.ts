import {assemble, assembleCheck as check} from '../../asm';
import {AsmError} from '../../asm/base';
import {StaticSourceResolver} from '../source';
import {Result, System} from '../../core';

export function assembleAndBoot(sys: System, code: string): Result {
  const resolver = new StaticSourceResolver();
  const source = {path: 'entrypoint.con', code};
  resolver.add(source);
  sys.loadProgram(assemble(resolver, source.path));
  return sys.boot();
}

export function assembleCheck(code: string): AsmError[] {
  const resolver = new StaticSourceResolver();
  const source = {path: 'entrypoint.con', code};
  resolver.add(source);
  return check(resolver, source.path);
}