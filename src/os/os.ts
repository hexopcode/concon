import {assemble} from '../asm';
import {LinkerOptions} from '../asm/codegen';
import {StaticSourceResolver} from '../lib/source';
import {VERSION_0_1} from '../core';
import boot from './boot.con';

const LINKER_OPTIONS: LinkerOptions = {
  header: false,
  version: VERSION_0_1,
}

export function create_os_image(): Uint8Array {
  const resolver = new StaticSourceResolver();
  const entrypoint = 'entrypoint.con';
  resolver.add(entrypoint, boot);
  return assemble(resolver, entrypoint, LINKER_OPTIONS);
}