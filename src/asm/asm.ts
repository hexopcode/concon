import {Opcodes} from '../core';
import {AsmError} from './base';
import {codegen, DEFAULT_LINKER_OPTIONS, link, LinkerOptions} from './codegen';
import {check, parse, tokenize} from './parser';

const END_PROGRAM = new Uint8Array([Opcodes.END]);

type ErrorLogger = (errors: AsmError[]) => void;

function logErrors(errors: AsmError[]) {
  if (errors.length > 0) {
    errors.forEach(asmError => {
      console.error(`Error at line ${asmError.line}: ${asmError.message}`);
    });
  }
}

export function assemble(source: string, linkerOptions: LinkerOptions = DEFAULT_LINKER_OPTIONS): Uint8Array {
  return new Assembler(source, linkerOptions, logErrors).assemble();
}

export function assembleCheck(source: string, linkerOptions: LinkerOptions = DEFAULT_LINKER_OPTIONS): AsmError[] {
  const asm = new Assembler(source, linkerOptions);
  asm.assemble();
  return asm.errors;
}

class Assembler {
  private readonly source: string;
  private readonly linkerOptions: LinkerOptions;
  private readonly errorLogger: ErrorLogger;
  readonly errors: AsmError[];

  constructor(source: string, linkerOptions: LinkerOptions, errorLogger: ErrorLogger = () => {}) {
    this.source = source;
    this.linkerOptions = linkerOptions;
    this.errorLogger = errorLogger;
    this.errors = [];
  }

  assemble(): Uint8Array {
    const collectErrors = this.errors.push.bind(this.errors);
    
    const tokens = tokenize(this.source, collectErrors);
    if (this.errors.length > 0) {
      this.errorLogger(this.errors);
      return END_PROGRAM;
    }

    const ast = parse(tokens, collectErrors);
    if (this.errors.length > 0) {
      this.errorLogger(this.errors);
      return END_PROGRAM;
    }

    check(ast, collectErrors);
    if (this.errors.length > 0) {
      this.errorLogger(this.errors);
      return END_PROGRAM;
    }
    
    const program = codegen(ast, collectErrors);
    if (this.errors.length > 0) {
      this.errorLogger(this.errors);
      return END_PROGRAM;
    }

    const bytes = link(program, this.linkerOptions);
    if (this.errors.length > 0) {
      this.errorLogger(this.errors);
      return END_PROGRAM;
    }
    
    return bytes;
  }
}