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
    mov r0, ${MEMORY_PROGRAM_OFFSET + HEADER_OFFSET + CODE_OFFSET}
    
    // prepare stack
    lod r1, ${MEMORY_PROGRAM_OFFSET + HEADER_OFFSET + STACK_ADDRESS_OFFSET}
    add r1, r0
    mov rsp, r1

    // prepare to jump to start address
    lod r2, ${MEMORY_PROGRAM_OFFSET + HEADER_OFFSET + START_ADDRESS_OFFSET}
    add r2, r0

    jmp r2
  `, LINKER_OPTIONS);
}