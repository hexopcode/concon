import {Token, TokenType} from './tokenizer';
import {Stmt, MoviInstr} from './ast';
import {Opcodes, Registers} from '../../core';
import {unreachable} from '../../lib';
import {AsmErrorCollector} from '../base';

export function parse(tokens: Token[], collectError: AsmErrorCollector) {
  return new Parser(tokens, collectError).parse();
}

class Parser {
  private readonly tokens: Token[];
  private readonly collectError: AsmErrorCollector;
  private current: number;

  constructor(tokens: Token[], collectError: AsmErrorCollector) {
    this.tokens = tokens;
    this.collectError = collectError;
    this.current = 0;
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
    if (this.match(TokenType.NOP)) {
      return {type: 'NopInstr', opcode: Opcodes.NOP};
    } else if (this.match(TokenType.END)) {
      return {type: 'EndInstr', opcode: Opcodes.END};
    } else if (this.match(TokenType.VSYNC)) {
      return {type: 'VsyncInstr', opcode: Opcodes.VSYNC};
    } else if (this.match(TokenType.MOVI)) {
      return this.moviInstr();
    }
    unreachable(`Invalid token: ${TokenType[this.peek()?.type!]}`);
  }

  private moviInstr(): MoviInstr {
    const reg = this.consume(TokenType.REGISTER, 'Expected register');
    this.consume(TokenType.COMMA, `Expected ',`);
    const imm = this.consume(TokenType.NUMBER, 'Expected number');
    return {
      type: 'MoviInstr',
      opcode: Opcodes.MOVI,
      register: (reg.literal!) as Registers,
      immediate: (imm.literal!) as number,
    };
  }
}