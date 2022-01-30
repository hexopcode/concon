import {Token, TokenType} from './tokenizer';
import {
  Stmt,
  MoviInstr,
  MovrInstr,
  LodrInstr,
  LodrbInstr,
  StoiInstr,
  StoibInstr,
  StoriInstr,
  StoribInstr,
  StorInstr,
  StorbInstr,
  StorrInstr,
  StorrbInstr,
  JmpiInstr,
} from './ast';
import {Opcodes, Registers} from '../../core';
import {unreachable} from '../../lib';
import {AsmErrorCollector} from '../base';
import {  } from '.';

export function parse(tokens: Token[], collectError: AsmErrorCollector) {
  return new Parser(tokens, collectError).parse();
}

class Parser {
  private readonly tokens: Token[];
  private readonly collectError: AsmErrorCollector;
  private current: number;
  private line: number;

  constructor(tokens: Token[], collectError: AsmErrorCollector) {
    this.tokens = tokens;
    this.collectError = collectError;
    this.current = 0;
    this.line = 1;
  }

  parse(): Stmt[] {
    const statements: Stmt[] = [];
    while (!this.isAtEnd()) {
      try {
        statements.push(this.statement());
      } catch (e) {
        this.collectError({
          line: 0,
          message: (e as Error).message,
        });
      }
    }
    return statements;
  }

  private isAtEnd(): boolean {
    return !this.peek() || this.peek()!.type == TokenType.EOF;
  }

  private peek(): Token|undefined {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) {
      return false;
    }
    return this.peek()!.type == type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current++;
    }
    return this.previous();
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance();
    }
    throw new Error(`Invalid token: ${TokenType[type]}`);
  }

  private statement(): Stmt {
    this.line = this.peek()?.line || -1;
    if (this.match(TokenType.NOP)) {
      return {
        type: 'NopInstr',
        opcode: Opcodes.NOP,
        line: this.line,
      };
    } else if (this.match(TokenType.END)) {
      return {
        type: 'EndInstr',
        opcode: Opcodes.END,
        line: this.line,
      };
    } else if (this.match(TokenType.VSYNC)) {
      return {
        type: 'VsyncInstr',
        opcode: Opcodes.VSYNC,
        line: this.line,
      };
    } else if (this.match(TokenType.MOVI)) {
      return this.moviInstr();
    } else if (this.match(TokenType.MOVR)) {
      return this.movrInstr();
    } else if (this.match(TokenType.STOI)) {
      return this.stoiInstr();
    } else if (this.match(TokenType.STOIB)) {
      return this.stoibInstr();
    } else if (this.match(TokenType.STORI)) {
      return this.storiInstr();
    } else if (this.match(TokenType.STORIB)) {
      return this.storibInstr();
    } else if (this.match(TokenType.STOR)) {
      return this.storInstr();
    } else if (this.match(TokenType.STORB)) {
      return this.storbInstr();
    } else if (this.match(TokenType.STORR)) {
      return this.storrInstr();
    } else if (this.match(TokenType.STORRB)) {
      return this.storrbInstr();
    } else if (this.match(TokenType.LODR)) {
      return this.lodrInstr();
    } else if (this.match(TokenType.LODRB)) {
      return this.lodrbInstr();
    } else if (this.match(TokenType.JMPI)) {
      return this.jmpiInstr();
    }
    unreachable(`Invalid token: ${TokenType[this.peek()?.type!]}`);
  }

  private reg(): Token {
    return this.consume(TokenType.REGISTER, 'Expected register');
  }

  private imm(): Token {
    return this.consume(TokenType.NUMBER, 'Expected immediate');
  }

  private addr(): Token {
    return this.consume(TokenType.NUMBER, 'Expected address');
  }

  private comma() {
    this.consume(TokenType.COMMA, `'Expected ','`);
  }

  private moviInstr(): MoviInstr {
    const reg = this.reg();
    this.comma();
    const imm = this.imm();
    return {
      type: 'MoviInstr',
      opcode: Opcodes.MOVI,
      line: this.line,
      register: (reg.literal!) as Registers,
      immediate: (imm.literal!) as number,
    };
  }

  private movrInstr(): MovrInstr {
    const reg1 = this.reg();
    this.comma();
    const reg2 = this.reg();
    return {
      type: 'MovrInstr',
      opcode: Opcodes.MOVR,
      line: this.line,
      register1: (reg1.literal!) as Registers,
      register2: (reg2.literal!) as Registers,
    };
  }

  private stoiInstr(): StoiInstr {
    const addr = this.addr();
    this.comma();
    const imm = this.imm();
    return {
      type: 'StoiInstr',
      opcode: Opcodes.STOI,
      line: this.line,
      address: (addr.literal!) as number,
      immediate: (imm.literal!) as number,
    };
  }

  private stoibInstr(): StoibInstr {
    const addr = this.addr();
    this.comma();
    const imm = this.imm();
    return {
      type: 'StoibInstr',
      opcode: Opcodes.STOIB,
      line: this.line,
      address: (addr.literal!) as number,
      immediate: (imm.literal!) as number,
    };
  }

  private storiInstr(): StoriInstr {
    const reg = this.reg();
    this.comma();
    const imm = this.imm();
    return {
      type: 'StoriInstr',
      opcode: Opcodes.STORI,
      line: this.line,
      register: (reg.literal!) as Registers,
      immediate: (imm.literal!) as number,
    };
  }

  private storibInstr(): StoribInstr {
    const reg = this.reg();
    this.comma();
    const imm = this.imm();
    return {
      type: 'StoribInstr',
      opcode: Opcodes.STORIB,
      line: this.line,
      register: (reg.literal!) as Registers,
      immediate: (imm.literal!) as number,
    };
  }

  private storInstr(): StorInstr {
    const addr = this.addr();
    this.comma();
    const reg = this.reg();
    return {
      type: 'StorInstr',
      opcode: Opcodes.STOR,
      line: this.line,
      address: (addr.literal!) as number,
      register: (reg.literal!) as Registers,
    };
  }

  private storbInstr(): StorbInstr {
    const addr = this.addr();
    this.comma();
    const reg = this.reg();
    return {
      type: 'StorbInstr',
      opcode: Opcodes.STORB,
      line: this.line,
      address: (addr.literal!) as number,
      register: (reg.literal!) as Registers,
    };
  }

  private storrInstr(): StorrInstr {
    const reg1 = this.reg();
    this.comma();
    const reg2 = this.reg();
    return {
      type: 'StorrInstr',
      opcode: Opcodes.STORR,
      line: this.line,
      register1: (reg1.literal!) as Registers,
      register2: (reg2.literal!) as Registers,
    };
  }

  private storrbInstr(): StorrbInstr {
    const reg1 = this.reg();
    this.comma();
    const reg2 = this.reg();
    return {
      type: 'StorrbInstr',
      opcode: Opcodes.STORRB,
      line: this.line,
      register1: (reg1.literal!) as Registers,
      register2: (reg2.literal!) as Registers,
    };
  }

  private lodrInstr(): LodrInstr {
    const reg = this.reg();
    this.comma();
    const addr = this.addr();
    return {
      type: 'LodrInstr',
      opcode: Opcodes.LODR,
      line: this.line,
      register: (reg.literal!) as Registers,
      address: (addr.literal!) as number,
    };
  }

  private lodrbInstr(): LodrbInstr {
    const reg = this.reg();
    this.comma();
    const addr = this.addr();
    return {
      type: 'LodrbInstr',
      opcode: Opcodes.LODRB,
      line: this.line,
      register: (reg.literal!) as Registers,
      address: (addr.literal!) as number,
    };
  }

  private jmpiInstr(): JmpiInstr {
    // TODO: add support for labels
    const addr = this.addr();
    return {
      type: 'JmpiInstr',
      opcode: Opcodes.JMPI,
      line: this.line,
      address: (addr.literal!) as number,
    };
  }
}