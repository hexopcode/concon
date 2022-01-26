import {AsmError} from './base';
import {codegen} from './codegen';
import {parse, tokenize, tokenString} from './parser';

export function assemble(source: string): Uint8Array {
  const errors: AsmError[] = [];
  const tokens = tokenize(source, errors.push);
  const ast = parse(tokens);
  const bytes = codegen(ast);
  
  console.log(tokens.map(tokenString));
  console.log(ast);
  console.log(bytes);
  
  return bytes;
}