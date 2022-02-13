import {assemble} from '../asm';
import {LinkerOptions} from '../asm/codegen';
import {CODE_OFFSET, HEADER_OFFSET, MEMORY_PROGRAM_OFFSET, STACK_ADDRESS_OFFSET, START_ADDRESS_OFFSET, VERSION_0_1} from '../core';

const LINKER_OPTIONS: LinkerOptions = {
  header: false,
  version: VERSION_0_1,
}

export function create_boot(): Uint8Array {
  // TODO: check for header correctness
  // FIXME: move address computation to boot code itself
  return assemble(`
    MOV R0, ${MEMORY_PROGRAM_OFFSET + HEADER_OFFSET + CODE_OFFSET}
    
    // prepare stack
    LOD R1, ${MEMORY_PROGRAM_OFFSET + HEADER_OFFSET + STACK_ADDRESS_OFFSET}
    ADD R1, R0
    MOV RSP, R1

    // prepare to jump to start address
    LOD R2, ${MEMORY_PROGRAM_OFFSET + HEADER_OFFSET + START_ADDRESS_OFFSET}
    ADD R2, R0

    JMP R2
  `, LINKER_OPTIONS);
}