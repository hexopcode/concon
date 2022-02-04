import {Opcodes} from '../core';
import {AsmError} from './base';
import {codegen} from './codegen';
import {check, parse, tokenize, tokenString} from './parser';

const END_PROGRAM = new Uint8Array([Opcodes.END]);

function logErrors(errors: AsmError[]) {
  if (errors.length > 0) {
    errors.forEach(asmError => {
      console.error(`Error at line ${asmError.line}: ${asmError.message}`);
    });
  }
}

export function assemble(source: string): Uint8Array {
  const errors: AsmError[] = [];
  const collectErrors = errors.push.bind(errors);
  
  const tokens = tokenize(source, collectErrors);
  if (errors.length > 0) {
    console.error('Fatal error(s) in tokenizer');
    logErrors(errors);
    return END_PROGRAM;
  }

  const ast = parse(tokens, collectErrors);
  if (errors.length > 0) {
    console.error('Fatal error(s) in parser');
    logErrors(errors);
    return END_PROGRAM;
  }

  check(ast, collectErrors);
  if (errors.length > 0) {
    console.error('Fatal error(s) in checker');
    logErrors(errors);
    return END_PROGRAM;
  }
  
  const bytes = codegen(ast, collectErrors);
  if (errors.length > 0) {
    console.error('Fatal error(s) in codegen');
    logErrors(errors);
    return END_PROGRAM;
  }
  
  // console.log(tokens.map(tokenString));
  // console.log(ast);
  // console.log(bytes);
  
  return bytes;
}

export function assembleCheck(source: string): AsmError[] {
  const errors: AsmError[] = [];
  const collectErrors = errors.push.bind(errors);
  
  const tokens = tokenize(source, collectErrors);
  if (errors.length > 0) {
    return errors;
  }
  
  const ast = parse(tokens, collectErrors);
  if (errors.length > 0) {
    return errors;
  }
  
  check(ast, collectErrors);
  if (errors.length > 0) {
    return errors;
  }

  codegen(ast, collectErrors);
  if (errors.length > 0) {
    return errors;
  }

  return [];
}