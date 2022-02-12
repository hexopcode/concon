import {assemble} from '../asm';
import {LinkerOptions} from '../asm/codegen';
import {CODE_OFFSET, HEADER_OFFSET, MEMORY_PROGRAM_OFFSET, START_ADDRESS_OFFSET, VERSION_0_1} from '../core';

const LINKER_OPTIONS: LinkerOptions = {
  header: false,
  version: VERSION_0_1,
}

export function create_boot(): Uint8Array {
  // TODO: check for header correctness
  // FIXME: move address computation to boot code itself
  return assemble(`
    MOV R0, ${MEMORY_PROGRAM_OFFSET + HEADER_OFFSET + CODE_OFFSET}
    LOD R1, ${MEMORY_PROGRAM_OFFSET + HEADER_OFFSET + START_ADDRESS_OFFSET}

    ADD R0, R1

    JMP R0
  `, LINKER_OPTIONS);
}