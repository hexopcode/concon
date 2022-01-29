import {AsmError} from './base';
import {codegen} from './codegen';
import {parse, tokenize, tokenString} from './parser';

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
  logErrors(errors);
  const ast = parse(tokens, collectErrors);
  logErrors(errors);
  const bytes = codegen(ast, collectErrors);
  logErrors(errors);
  
  console.log(tokens.map(tokenString));
  console.log(ast);
  console.log(bytes);
  
  return bytes;
}

export function assembleCheck(source: string): AsmError[] {
  const errors: AsmError[] = [];
  const collectErrors = errors.push.bind(errors);
  const tokens = tokenize(source, collectErrors);
  const ast = parse(tokens, collectErrors);
  const bytes = codegen(ast, collectErrors);
  return errors;
}