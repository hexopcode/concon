import {assemble} from '../asm';

export function create_boot(): Uint8Array {
  return assemble(`
    JMP 0x2000
  `);
}