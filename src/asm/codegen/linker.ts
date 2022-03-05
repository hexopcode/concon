import {
  CODE_OFFSET,
  CODE_SIZE_OFFSET,
  HEADER_LENGTH,
  HEADER_OFFSET,
  MAGIC_OFFSET,
  MAGIC_SIGNATURE,
  MEMORY_PROGRAM_OFFSET,
  STACK_ADDRESS_OFFSET,
  START_ADDRESS_OFFSET,
  VERSION_0_1,
  VERSION_OFFSET,
} from '../../core';
import { AstImmExpr } from '../parser';
import {Program} from './program';
import {byte, word} from './utilities';

export type LinkerOptions = {
  header: boolean,
  version: Uint8Array,
};

export const DEFAULT_LINKER_OPTIONS: LinkerOptions = {
  header: true,
  version: VERSION_0_1,
};

export function link(program: Program, options: LinkerOptions = DEFAULT_LINKER_OPTIONS): Uint8Array {
  return new Linker(program, options).link();
}

class Linker {
  private readonly program: Program;
  private readonly options: LinkerOptions;

  constructor(program: Program, options: LinkerOptions) {
    this.program = program;
    this.options = options;
  }

  link(): Uint8Array {
    this.resolveCodeExprs();

    if (!this.options.header) {
      // FIXME: the assembler should guarantee that the code
      // doesn't set a custom start offset
      return this.program.code;
    }

    const hdr = this.header();

    const bytes = new Uint8Array(HEADER_LENGTH + this.program.code.length);
    bytes.set(hdr, HEADER_OFFSET);
    bytes.set(this.program.code, CODE_OFFSET);
    return bytes;
  }

  private resolveCodeExprs() {
    for (const [offset, expr] of this.program.codeExprs.entries()) {
      const value = this.resolveExpr(expr);
      this.program.code.set(expr.isByte ? byte(value) : word(value), offset);
    }
  }

  private resolveExpr(expr: AstImmExpr): number {
    if (typeof expr.value == 'number') {
      return expr.value;
    }

    if (!this.program.labels.has(expr.value)) {
      throw new Error(`Cannot resolve label '${expr.value}'`);
    }

    const offset = this.program.labels.get(expr.value)!;
    const headerLength = this.options.header ? HEADER_LENGTH : 0;
    const absolute = MEMORY_PROGRAM_OFFSET + headerLength + offset;
    return absolute;
  }

  private header(): Uint8Array {
    const bytes = new Uint8Array(HEADER_LENGTH);
    bytes.set(MAGIC_SIGNATURE, MAGIC_OFFSET);
    bytes.set(this.options.version, VERSION_OFFSET);
    bytes.set(word(this.program.startAddr + this.program.code.length), STACK_ADDRESS_OFFSET);
    bytes.set(word(this.program.startAddr), START_ADDRESS_OFFSET);
    bytes.set(word(this.program.code.length), CODE_SIZE_OFFSET);
    return bytes;
  }
}