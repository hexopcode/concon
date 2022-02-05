import {Opcodes} from '../../core';
import {unreachable} from '../../lib';
import {AsmErrorCollector} from '../base';
import {Address, Stmt} from '../parser';

const FAKE_ADDR: number[] = [0xFF, 0xFF];

export function codegen(ast: Stmt[], collectError: AsmErrorCollector) {
  return new Codegen(ast, collectError).codegen();
}

class Codegen {
  private readonly ast: Stmt[];
  private readonly collectError: AsmErrorCollector;
  private readonly bytes: number[];

  constructor(ast: Stmt[], collectError: AsmErrorCollector) {
    this.ast = ast;
    this.collectError = collectError;
    this.bytes = [];
  }

  codegen(): Uint8Array {
    this.opcodes();
    return new Uint8Array(this.bytes);
  }

  opcodes() {
    for (const stmt of this.ast) {
      try {
        switch (stmt.type) {
          case 'NopInstr':
            this.bytes.push(Opcodes.NOP);
            break;
          case 'EndInstr':
            this.bytes.push(Opcodes.END);
            break;
          case 'VsyncInstr':
            this.bytes.push(Opcodes.VSYNC);
            break;
          case 'MoviInstr':
            this.bytes.push(Opcodes.MOVI, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'MovrInstr':
            this.bytes.push(Opcodes.MOVR, stmt.register1, stmt.register2);
            break;
          case 'StoiInstr':
            this.bytes.push(Opcodes.STOI, ...this.address(stmt.address), ...this.word(stmt.immediate));
            break;
          case 'StoibInstr':
            this.bytes.push(Opcodes.STOIB, ...this.address(stmt.address), ...this.word(stmt.immediate));
            break;
          case 'StoriInstr':
            this.bytes.push(Opcodes.STORI, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'StoribInstr':
            this.bytes.push(Opcodes.STORIB, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'StorInstr':
            this.bytes.push(Opcodes.STOR, ...this.address(stmt.address), stmt.register);
            break;
          case 'StorbInstr':
            this.bytes.push(Opcodes.STORB, ...this.address(stmt.address), stmt.register);
            break;
          case 'StorrInstr':
            this.bytes.push(Opcodes.STORR, stmt.register1, stmt.register2);
            break;
          case 'StorrbInstr':
            this.bytes.push(Opcodes.STORRB, stmt.register1, stmt.register2);
            break;
          case 'LodrInstr':
            this.bytes.push(Opcodes.LODR, stmt.register, ...this.address(stmt.address));
            break;
          case 'LodrbInstr':
            this.bytes.push(Opcodes.LODRB, stmt.register, ...this.address(stmt.address));
            break;
          case 'LodrrInstr':
            this.bytes.push(Opcodes.LODRR, stmt.register1, stmt.register2);
            break;
          case 'LodrrbInstr':
            this.bytes.push(Opcodes.LODRRB, stmt.register1, stmt.register2);
            break;
          case 'AddiInstr':
            this.bytes.push(Opcodes.ADDI, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'AddrInstr':
            this.bytes.push(Opcodes.ADDR, stmt.register1, stmt.register2);
            break;
          case 'SubiInstr':
            this.bytes.push(Opcodes.SUBI, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'SubrInstr':
            this.bytes.push(Opcodes.SUBR, stmt.register1, stmt.register2);
            break;
          case 'MuliInstr':
            this.bytes.push(Opcodes.MULI, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'MulrInstr':
            this.bytes.push(Opcodes.MULR, stmt.register1, stmt.register2);
            break;
          case 'DiviInstr':
            this.bytes.push(Opcodes.DIVI, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'DivrInstr':
            this.bytes.push(Opcodes.DIVR, stmt.register1, stmt.register2);
            break;
          case 'ModiInstr':
            this.bytes.push(Opcodes.MODI, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'ModrInstr':
            this.bytes.push(Opcodes.MODR, stmt.register1, stmt.register2);
            break;
          case 'IncInstr':
            this.bytes.push(Opcodes.INC, stmt.register);
            break;
          case 'DecInstr':
            this.bytes.push(Opcodes.DEC, stmt.register);
            break;
          case 'ShliInstr':
            this.bytes.push(Opcodes.SHLI, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'ShlrInstr':
            this.bytes.push(Opcodes.SHLR, stmt.register1, stmt.register2);
            break;
          case 'ShriInstr':
            this.bytes.push(Opcodes.SHRI, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'ShrrInstr':
            this.bytes.push(Opcodes.SHRR, stmt.register1, stmt.register2);
            break;
          case 'OriInstr':
            this.bytes.push(Opcodes.ORI, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'OrrInstr':
            this.bytes.push(Opcodes.ORR, stmt.register1, stmt.register2);
            break;
          case 'AndiInstr':
            this.bytes.push(Opcodes.ANDI, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'AndrInstr':
            this.bytes.push(Opcodes.ANDR, stmt.register1, stmt.register2);
            break;
          case 'XoriInstr':
            this.bytes.push(Opcodes.XORI, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'XorrInstr':
            this.bytes.push(Opcodes.XORR, stmt.register1, stmt.register2);
            break;
          case 'NotInstr':
            this.bytes.push(Opcodes.NOT, stmt.register);
            break;
          case 'CmpiInstr':
            this.bytes.push(Opcodes.CMPI, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'CmprInstr':
            this.bytes.push(Opcodes.CMPR, stmt.register1, stmt.register2);
            break;
          case 'JmpiInstr':
            this.bytes.push(Opcodes.JMPI, ...this.address(stmt.address));
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
  }

  word(n: number): number[] {
    return [n >> 8, n & 0xff];
  }

  address(addr: Address): number[] {
    if (typeof addr == 'number') {
      return this.word(addr);
    }
    return FAKE_ADDR;
  }
}