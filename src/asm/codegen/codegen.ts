import {Opcodes} from '../../core';
import {unreachable} from '../../lib';
import {AsmErrorCollector} from '../base';
import {Stmt} from '../parser';

export function codegen(ast: Stmt[], collectError: AsmErrorCollector) {
  return new Codegen(ast, collectError).codegen();
}

class Codegen {
  private readonly ast: Stmt[];
  private readonly collectError: AsmErrorCollector;

  constructor(ast: Stmt[], collectError: AsmErrorCollector) {
    this.ast = ast;
    this.collectError = collectError;
  }

  codegen(): Uint8Array {
    const bytes: number[] = [];

    for (const stmt of this.ast) {
      try {
        switch (stmt.type) {
          case 'NopInstr':
          case 'EndInstr':
          case 'VsyncInstr':
            bytes.push(stmt.opcode);
            break;
          case 'MoviInstr':
            bytes.push(Opcodes.MOVI, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'MovrInstr':
            bytes.push(Opcodes.MOVR, stmt.register1, stmt.register2);
            break;
          case 'StoiInstr':
            bytes.push(Opcodes.STOI, ...this.word(stmt.address), ...this.word(stmt.immediate));
            break;
          case 'StoibInstr':
            bytes.push(Opcodes.STOIB, ...this.word(stmt.address), ...this.word(stmt.immediate));
            break;
          case 'StoriInstr':
            bytes.push(Opcodes.STORI, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'StoribInstr':
            bytes.push(Opcodes.STORIB, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'StorInstr':
            bytes.push(Opcodes.STOR, ...this.word(stmt.address), stmt.register);
            break;
          case 'StorbInstr':
            bytes.push(Opcodes.STORB, ...this.word(stmt.address), stmt.register);
            break;
          case 'StorrInstr':
            bytes.push(Opcodes.STORR, stmt.register1, stmt.register2);
            break;
          case 'StorrbInstr':
            bytes.push(Opcodes.STORRB, stmt.register1, stmt.register2);
            break;
          case 'LodrInstr':
            bytes.push(Opcodes.LODR, stmt.register, ...this.word(stmt.address));
            break;
          case 'LodrbInstr':
            bytes.push(Opcodes.LODRB, stmt.register, ...this.word(stmt.address));
            break;
          case 'LodrrInstr':
            bytes.push(Opcodes.LODRR, stmt.register1, stmt.register2);
            break;
          case 'LodrrbInstr':
            bytes.push(Opcodes.LODRRB, stmt.register1, stmt.register2);
            break;
          case 'AddiInstr':
            bytes.push(Opcodes.ADDI, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'AddrInstr':
            bytes.push(Opcodes.ADDR, stmt.register1, stmt.register2);
            break;
          case 'SubiInstr':
            bytes.push(Opcodes.SUBI, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'SubrInstr':
            bytes.push(Opcodes.SUBR, stmt.register1, stmt.register2);
            break;
          case 'MuliInstr':
            bytes.push(Opcodes.MULI, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'MulrInstr':
            bytes.push(Opcodes.MULR, stmt.register1, stmt.register2);
            break;
          case 'DiviInstr':
            bytes.push(Opcodes.DIVI, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'DivrInstr':
            bytes.push(Opcodes.DIVR, stmt.register1, stmt.register2);
            break;
          case 'ModiInstr':
            bytes.push(Opcodes.MODI, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'ModrInstr':
            bytes.push(Opcodes.MODR, stmt.register1, stmt.register2);
            break;
          case 'IncInstr':
            bytes.push(Opcodes.INC, stmt.register);
            break;
          case 'DecInstr':
            bytes.push(Opcodes.DEC, stmt.register);
            break;
          case 'ShliInstr':
            bytes.push(Opcodes.SHLI, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'ShlrInstr':
            bytes.push(Opcodes.SHLR, stmt.register1, stmt.register2);
            break;
          case 'ShriInstr':
            bytes.push(Opcodes.SHRI, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'ShrrInstr':
            bytes.push(Opcodes.SHRR, stmt.register1, stmt.register2);
            break;
          case 'OriInstr':
            bytes.push(Opcodes.ORI, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'OrrInstr':
            bytes.push(Opcodes.ORR, stmt.register1, stmt.register2);
            break;
          case 'AndiInstr':
            bytes.push(Opcodes.ANDI, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'AndrInstr':
            bytes.push(Opcodes.ANDR, stmt.register1, stmt.register2);
            break;
          case 'XoriInstr':
            bytes.push(Opcodes.XORI, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'XorrInstr':
            bytes.push(Opcodes.XORR, stmt.register1, stmt.register2);
            break;
          case 'NotInstr':
            bytes.push(Opcodes.NOT, stmt.register);
            break;
          case 'JmpiInstr':
            // TODO: add support for labels
            bytes.push(Opcodes.JMPI, ...this.word(stmt.address));
            break;
          default:
            unreachable(`Unsupported statement: ${stmt}`);
        }
      } catch (e) {
        this.collectError({
          line: stmt.line,
          message: (e as Error).message,
        });
      }
    }

    return new Uint8Array(bytes);
  }

  word(n: number): number[] {
    return [n >> 8, n & 0xff];
  }
}