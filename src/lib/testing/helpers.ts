import {assemble, assembleCheck as check} from '../../asm';
import {AsmError} from '../../asm/base';
import {Source, StaticSourceResolver} from '../source';
import {Result, System} from '../../core';

export function assembleAndBoot(sys: System, code: string): Result {
  const resolver = new StaticSourceResolver();
  const source = {path: 'entrypoint.con', code, library: false};
  resolver.add(source);

  const bytecode = assemble(resolver, source.path);
  if (bytecode.isErr()) return Result.INVALID;

  sys.loadProgram(bytecode.unwrap());
  return sys.boot();
}

export function assembleMultiple(sys: System, entrypoint: string, sources: Source[]): Result {
  const resolver = new StaticSourceResolver();
  resolver.add(...sources);

  const bytecode = assemble(resolver, entrypoint);
  if (bytecode.isErr()) return Result.INVALID;

  sys.loadProgram(bytecode.unwrap());
  return sys.boot();
}

export function assembleCheck(code: string): AsmError[] {
  const resolver = new StaticSourceResolver();
  const source = {path: 'entrypoint.con', code, library: false};
  resolver.add(source);
  return check(resolver, source.path);
}