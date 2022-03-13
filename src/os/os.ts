import {assemble} from '../asm';
import {LinkerOptions} from '../asm/codegen';
import {StaticSourceResolver} from '../lib/source';
import {VERSION_0_1} from '../core';
import boot from './boot.con';
import {Result} from '../lib/types';
import {AsmError} from '../asm/base';

const LINKER_OPTIONS: LinkerOptions = {
  header: false,
  version: VERSION_0_1,
}

export function create_os_image(): Result<Uint8Array, AsmError> {
  const resolver = new StaticSourceResolver();
  resolver.add(boot);
  return assemble(resolver, boot.path, LINKER_OPTIONS);
}