import {Token, TokenType} from './tokenizer';
import {Stmt} from './ast';
import { Opcodes } from '../../core';
import {unreachable} from '../../lib';

export function parse(tokens: Token[]) {
  return new Parser(tokens).parse();
}

class Parser {
  private readonly tokens: Token[];
  private current: number;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.current = 0;
  }

  parse(): Stmt[] {
    const statements: Stmt[] = [];
    while (!this.isAtEnd()) {
      statements.push(this.statement());
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

  private statement(): Stmt {
    if (this.match(TokenType.NOP)) {
      return {type: 'NopInstr', opcode: Opcodes.NOP};
    } else if (this.match(TokenType.END)) {
      return {type: 'EndInstr', opcode: Opcodes.END};
    } else if (this.match(TokenType.VSYNC)) {
      return {type: 'VsyncInstr', opcode: Opcodes.VSYNC};
    }
    unreachable(`Invalid token: ${TokenType[this.peek()?.type!]}`);
  }
}