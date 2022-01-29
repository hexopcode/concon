import {assemble} from '../asm';

export function create_boot(): Uint8Array {
  return assemble(`
    JMPI 0x2000
  `);
}