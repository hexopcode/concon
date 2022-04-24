import {
  CODE_OFFSET,
  CODE_SIZE_OFFSET,
  ENTRYPOINT_ADDRESS_OFFSET,
  HEADER_LENGTH,
  HEADER_OFFSET,
  MAGIC_OFFSET,
  MAGIC_SIGNATURE,
  MEMORY_PROGRAM_OFFSET,
  STACK_ADDRESS_OFFSET,
  VERSION_0_1,
  VERSION_OFFSET,
} from '../../core';
import {err, ok, Result} from '../../lib/types';
import {AsmError} from '../base';
import {AstImmExpr} from '../parser';
import {Module, Program} from '../codegen/types';
import {byte, word} from '../codegen/utilities';

export type LinkerOptions = {
  header: boolean,
  baseAddress: number,
  version: Uint8Array,
};

export const DEFAULT_LINKER_OPTIONS: LinkerOptions = {
  header: true,
  baseAddress: MEMORY_PROGRAM_OFFSET,
  version: VERSION_0_1,
};

export function link(program: Program, options: LinkerOptions = DEFAULT_LINKER_OPTIONS): Result<Uint8Array, AsmError> {
  return new Linker(program, options).link();
}

class Linker {
  private readonly program: Program;
  private readonly options: LinkerOptions;
  private readonly offsets: Map<string, number>;

  constructor(program: Program, options: LinkerOptions) {
    this.program = program;
    this.options = options;
    this.offsets = new Map();
  }

  link(): Result<Uint8Array, AsmError> {
    const len = this.resolveOffsets();

    const rres = this.resolveCodeExprs(this.program.entrypoint);
    if (rres.isErr()) return err(rres);

    for (const lib of this.program.libs.values()) {
      const rres = this.resolveCodeExprs(lib);
      if (rres.isErr()) return err(rres);
    }
    
    const binary = this.generateBinary(len);
    if (!this.options.header) {
      // console.log('no header')
      return ok(binary);
    }

    // console.log('header')

    const hdr = this.header(binary.length);
    const bytes = new Uint8Array(HEADER_LENGTH + binary.length);
    bytes.set(hdr, HEADER_OFFSET);
    bytes.set(binary, CODE_OFFSET);
    return ok(bytes);
  }

  private resolveOffsets(): number {
    this.offsets.set(this.program.entrypoint.path, 0);
    let offset = this.program.entrypoint.code.length;

    for (const [path, lib] of this.program.libs.entries()) {
      this.offsets.set(path, offset);
      offset += lib.code.length;
    }

    return offset;
  }

  private generateBinary(len: number): Uint8Array {
    const ep = this.program.entrypoint;
    const epOffset = this.offsets.get(ep.path)!;
    const binary = new Uint8Array(len);
    binary.set(ep.code, epOffset);

    for (const [path, lib] of this.program.libs.entries()) {
      const offset = this.offsets.get(path)!;
      binary.set(lib.code, offset);
    }

    return binary;
  }

  private resolveCodeExprs(mod: Module): Result<void, AsmError> {
    for (const [offset, expr] of mod.codeExprs.entries()) {
      const value = this.resolveExpr(expr, mod);
      if (value.isErr()) return err(value);
      
      mod.code.set(expr.isByte ? byte(value.unwrap()) : word(value.unwrap()), offset);
    }
    return ok();
  }

  private resolveExpr(expr: AstImmExpr, mod: Module): Result<number, AsmError> {
    if (typeof expr.value == 'number') {
      return ok(expr.value);
    }

    const resolved = this.resolveModForExpr(expr.value, mod);
    if (resolved.isErr()) return err(resolved);

    const offset = this.offsets.get(resolved.unwrap().path)! + resolved.unwrap().labels.get(expr.value)!;
    const headerLength = this.options.header ? HEADER_LENGTH : 0;
    const absolute = this.options.baseAddress + headerLength + offset;

    return ok(absolute);
  }

  private resolveModForExpr(expr: string, mod: Module): Result<Module, AsmError> {
    if (mod.labels.has(expr)) {
      return ok(mod);
    }

    for (const [name, path] of mod.uses.entries()) {
      if (name == expr) {
        return ok(this.program.libs.get(path)!);
      }
    }

    return err({
      type: 'CodegenError',
      message: `Cannot resolve label '${expr}' in module ${mod.path} or its dependencies`,
    });
  }

  private header(binaryLength: number): Uint8Array {
    const bytes = new Uint8Array(HEADER_LENGTH);
    bytes.set(MAGIC_SIGNATURE, MAGIC_OFFSET);
    bytes.set(this.options.version, VERSION_OFFSET);
    bytes.set(word(binaryLength), STACK_ADDRESS_OFFSET);

    const entrypointOffset = this.offsets.get(this.program.entrypoint.path)! + this.program.entrypoint.mainOffset;
    bytes.set(word(entrypointOffset), ENTRYPOINT_ADDRESS_OFFSET);
    
    bytes.set(word(binaryLength), CODE_SIZE_OFFSET);
    return bytes;
  }
}