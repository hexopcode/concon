import {Opcodes} from '../core';
import {AsmError} from './base';
import {codegen, DEFAULT_LINKER_OPTIONS, link, LinkerOptions} from './codegen';
import {check, parse, tokenize, SourceResolver} from './parser';

const END_PROGRAM = new Uint8Array([Opcodes.END]);

type ErrorLogger = (errors: AsmError[]) => void;

function logErrors(errors: AsmError[]) {
  if (errors.length > 0) {
    errors.forEach(asmError => {
      console.error(`Error at line ${asmError.line}: ${asmError.message}`);
    });
  }
}

export function assemble(resolver: SourceResolver, entrypoint: string, linkerOptions: LinkerOptions = DEFAULT_LINKER_OPTIONS): Uint8Array {
  return new Assembler(resolver, linkerOptions, logErrors).assemble(entrypoint);
}

export function assembleCheck(resolver: SourceResolver, entrypoint: string, linkerOptions: LinkerOptions = DEFAULT_LINKER_OPTIONS): AsmError[] {
  const asm = new Assembler(resolver, linkerOptions);
  asm.assemble(entrypoint);
  return asm.errors;
}

class Assembler {
  private readonly resolver: SourceResolver;
  private readonly linkerOptions: LinkerOptions;
  private readonly errorLogger: ErrorLogger;
  readonly errors: AsmError[];

  constructor(resolver: SourceResolver, linkerOptions: LinkerOptions, errorLogger: ErrorLogger = () => {}) {
    this.resolver = resolver;
    this.linkerOptions = linkerOptions;
    this.errorLogger = errorLogger;
    this.errors = [];
  }

  assemble(entrypoint: string): Uint8Array {
    const collectErrors = this.errors.push.bind(this.errors);

    const source = this.resolver.resolve(entrypoint);
    if (source == undefined) {
      this.errors.push({
        line: -1,
        message: `source not found: ${entrypoint}`,
      });
      this.errorLogger(this.errors);
      return END_PROGRAM;
    }
    
    const tokens = tokenize(source!, collectErrors);
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