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
    // palette[0] = 0x9bbc0fff
    out 0x00, 0x009b
    out 0x00, 0x10bc
    out 0x00, 0x200f
    out 0x00, 0x30ff
    
    // palette[1] = 0x8bac0fff
    out 0x00, 0x018b
    out 0x00, 0x11ac
    out 0x00, 0x210f
    out 0x00, 0x31ff

    // palette[2] = 0x306230ff
    out 0x00, 0x0230
    out 0x00, 0x1262
    out 0x00, 0x2230
    out 0x00, 0x32ff

    // palette[3] = 0x0f380fff
    out 0x00, 0x030f
    out 0x00, 0x1338
    out 0x00, 0x230f
    out 0x00, 0x33ff

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