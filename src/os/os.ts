import {assemble} from '../asm';
import {LinkerOptions} from '../asm/linker';
import {StaticSourceResolver} from '../lib/source';
import {VERSION_0_1} from '../core';
import {source as boot} from './boot.con';
import {palette} from '../lib/con';
import {Result} from '../lib/types';
import {AsmError} from '../asm/base';

const LINKER_OPTIONS: LinkerOptions = {
  header: false,
  version: VERSION_0_1,
};

export function create_os_image(isTestEnv: boolean = false): Result<Uint8Array, AsmError> {
  const resolver = new StaticSourceResolver();
  resolver.add(boot, palette);
  return assemble(
    isTestEnv ? resolver.forTestEnv() : resolver,
    StaticSourceResolver.normalize(boot.path),
    LINKER_OPTIONS);
}