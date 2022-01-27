import {unreachable} from '../../lib';
import {Stmt} from '../parser';

export function codegen(ast: Stmt[]) {
  return new Codegen(ast).codegen();
}

class Codegen {
  private readonly ast: Stmt[];

  constructor(ast: Stmt[]) {
    this.ast = ast;
  }

  codegen(): Uint8Array {
    const bytes: number[] = [];

    for (const stmt of this.ast) {
      switch (stmt.type) {
        case 'NopInstr':
        case 'EndInstr':
        case 'VsyncInstr':
          bytes.push(stmt.opcode);
          break;
        case 'MoviInstr':
          bytes.push(stmt.opcode);
          bytes.push(stmt.register);
          bytes.push(...this.word(stmt.immediate));
          break;
        default:
          unreachable(`Unsupported statement: ${stmt}`);
      }
    }

    return new Uint8Array(bytes);
  }

  word(n: number): number[] {
    return [n >> 8, n & 0xff];
  }
}