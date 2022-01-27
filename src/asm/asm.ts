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
  const tokens = tokenize(source, errors.push);
  logErrors(errors);
  const ast = parse(tokens, errors.push);
  logErrors(errors);
  const bytes = codegen(ast);
  
  console.log(tokens.map(tokenString));
  console.log(ast);
  console.log(bytes);
  
  return bytes;
}