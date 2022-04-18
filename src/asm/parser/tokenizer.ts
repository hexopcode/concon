import {Registers} from '../../core';
import {err, ok, Result} from '../../lib/types';
import {ParserError} from '../base';

export enum TokenType {
  // punctuation
  COMMA,
  COLON,
  DOT,
  SLASH,
  LPAREN,
  RPAREN,
  EOL,
  EOF,

  // misc
  IDENTIFIER,
  // native
  REGISTER,
  STRING,
  NUMBER,

  // instructions
  NOP,
  END,
  VSYNC,
  BRK,

  MOV,
  STO,
  STOB,
  LOD,
  LODB,

  ADD,
  SUB,
  MUL,
  DIV,
  MOD,
  INC,
  DEC,

  SHL,
  SHR,
  OR,
  AND,
  XOR,
  NOT,

  CMP,

  JMP,
  JZ,
  JNZ,
  JG,
  JGZ,
  JL,
  JLZ,
  JO,
  JDZ,

  PUSH,
  PUSHALL,
  POP,
  POPALL,
  CALL,
  PROC,
  RET,

  OUT,
  OUTB,

  DB,
  DW,
  DSTR,

  PUB,
  USE,
  FROM,

  IMM8,
  IMM16,
}

const Keywords: Map<string, TokenType> = new Map(Object.entries({
  'nop': TokenType.NOP,
  'end': TokenType.END,
  'vsync': TokenType.VSYNC,
  'brk': TokenType.BRK,
  
  'mov': TokenType.MOV,
  'sto': TokenType.STO,
  'stob': TokenType.STOB,
  'lod': TokenType.LOD,
  'lodb': TokenType.LODB,

  'add': TokenType.ADD,
  'sub': TokenType.SUB,
  'mul': TokenType.MUL,
  'div': TokenType.DIV,
  'mod': TokenType.MOD,
  'inc': TokenType.INC,
  'dec': TokenType.DEC,

  'shl': TokenType.SHL,
  'shr': TokenType.SHR,
  'or': TokenType.OR,
  'and': TokenType.AND,
  'xor': TokenType.XOR,
  'not': TokenType.NOT,

  'cmp': TokenType.CMP,

  'jmp': TokenType.JMP,
  'jz': TokenType.JZ,
  'jnz': TokenType.JNZ,
  'jg': TokenType.JG,
  'jgz': TokenType.JGZ,
  'jl': TokenType.JL,
  'jlz': TokenType.JLZ,
  'jo': TokenType.JO,
  'jdz': TokenType.JDZ,

  'push': TokenType.PUSH,
  'pushall': TokenType.PUSHALL,
  'pop': TokenType.POP,
  'popall': TokenType.POPALL,
  'call': TokenType.CALL,
  'proc': TokenType.PROC,
  'ret': TokenType.RET,

  'out': TokenType.OUT,
  'outb': TokenType.OUTB,

  'db': TokenType.DB,
  'dw': TokenType.DW,
  'dstr': TokenType.DSTR,

  'pub': TokenType.PUB,
  'use': TokenType.USE,
  'from': TokenType.FROM,

  'imm8': TokenType.IMM8,
  'imm16': TokenType.IMM16,
}));

export type Token = {
  type: TokenType;
  lexeme: string;
  literal?: any;
  line: number;
};

export function tokenString(token: Token): string {
  return `${TokenType[token.type]} ${token.lexeme} ${token.literal}`;
}

export function tokenize(source: string): Result<Token[], ParserError> {
  return new Tokenizer(source).tokenize();
}

class Tokenizer {
  private readonly source: string;
  private readonly tokens: Token[];
  private start: number;
  private current: number;
  private line: number;

  constructor(source: string) {
    this.source = source;
    this.tokens = [];
    this.start = 0;
    this.current = 0;
    this.line = 1;
  }

  tokenize(): Result<Token[], ParserError> {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push({
      type: TokenType.EOF,
      lexeme: '',
      line: this.line,
    });

    return ok(this.tokens);
  }

  private isAtEnd(ahead: number = 0): boolean {
    return this.current + ahead >= this.source.length;
  }

  private scanToken(): Result<void, ParserError> {
    const c = this.advance();
    switch (c) {
      case ',':
        this.addToken(TokenType.COMMA);
        break;
      case ':':
        this.addToken(TokenType.COLON);
        break;
      case '.':
        this.addToken(TokenType.DOT);
        break;
      case '(':
        this.addToken(TokenType.LPAREN);
        break;
      case ')':
        this.addToken(TokenType.RPAREN);
        break;
      case '/':
        if (this.match('/')) {
          while (this.peek() != '\n' && !this.isAtEnd()) {
            this.advance();
          }
        } else if (this.match('*')) {
          const line = this.line;
          while (this.peek() != '*' || (this.peek() == '*' && this.peek(1) != '/')) {
            if (this.isAtEnd()) {
              break;
            }

            const cc = this.advance();
            if (cc == '\n') {
              this.line++;
            }
          }
          if (this.match('*') && this.peek() == '/') {
            this.advance();
          } else if (this.isAtEnd()) {
            return err({
              type: 'ParserError',
              line,
              message: `Could not find closing comment section`,
            });
          }
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;
      case ' ':
      case '\r':
      case '\t':
        break;
      case '\n':
        this.addToken(TokenType.EOL);
        this.line++;
        break;
      case '"':
        const res = this.string();
        if (res.isErr()) return res;
        break;
      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          if (this.isRegister(c)) {
            this.register();
          } else {
            this.identifier();
          }
        } else {
          return err({
            type: 'ParserError',
            line: this.line,
            message: `Unexpected character: '${c}'`,
          });
        }
        break;
    }
    return ok();
  }

  private advance(): string {
    return this.source.charAt(this.current++);
  }

  private addToken(type: TokenType, literal?: any) {
    const lexeme = this.source.substring(this.start, this.current);
    this.tokens.push({
      type,
      lexeme,
      literal,
      line: this.line,
    });
  }

  private match(c: string): boolean {
    if (this.isAtEnd()) {
      return false;
    }
    if (this.source.charAt(this.current) != c) {
      return false;
    }

    this.current++;
    return true;
  }

  private peek(ahead: number = 0): string {
    if (this.isAtEnd(ahead)) {
      return '\0';
    }
    return this.source.charAt(this.current + ahead);
  }

  private string(): Result<void, ParserError> {
    while (this.peek() != '"' && !this.isAtEnd()) {
      if (this.peek() == '\n') {
        this.line++;
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      return err({
        type: 'ParserError',
        line: this.line,
        message: 'Unterminated string',
      });
    }

    this.advance();
    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);

    return ok();
  }

  private isDigit(c: string): boolean {
    return c >= '0' && c <= '9';
  }

  private isOneOf(c: string, search: string): boolean {
    return search.includes(c);
  }

  private number() {
    let radix = 10;
    let digits = '0123456789';
    switch (this.peek()) {
      case 'b':
      case 'B':
        radix = 2;
        digits = '01';
        this.advance();
        break;
      case 'o':
      case 'O':
        radix = 8;
        digits = '01234567';
        this.advance();
        break;
      case 'x':
      case 'X':
        radix = 16;
        digits = '0123456789aAbBcCdDeEfF';
        this.advance();
        break;
      default:
        break;
    }

    while (this.isOneOf(this.peek(), digits)) {
      this.advance();
    }

    const shift = radix == 10 ? 0 : 2;
    const value = Number.parseInt(this.source.substring(this.start + shift, this.current), radix);
    this.addToken(TokenType.NUMBER, value);
  }

  private isAlpha(c: string): boolean {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c == '_');
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private identifier() {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }

    const text = this.source.substring(this.start, this.current);
    if (Keywords.has(text)) {
      this.addToken(Keywords.get(text)!);
    } else {
      this.addToken(TokenType.IDENTIFIER, text);
    }
  }

  private isRegister(c: string): boolean {
    if (c != 'r') {
      return false;
    }

    const c1 = this.peek();
    const c2 = this.peek(1);

    return (c1 >= '0' && c1 <= '9') ||
        (c1 == '1' && c2 >= '0' && c2 <= '5') ||
        (c1 == 'i' && c2 == 'p') ||
        (c1 == 's' && c2 == 'p') ||
        (c1 == 'f' && c2 == 'l') ||
        (c1 == 'i' && c2 == 'n');
  }

  private register() {
    const c1 = this.advance();
    const c2 = this.peek();
    
    if (c1 == '0' || (c1 >= '2' && c1 <= '9')) {
      this.addToken(TokenType.REGISTER, Number.parseInt(c1, 10) as Registers);
    } else if (c1 == '1') {
      if (c2 >= '0' && c2 <= '5') {
        this.advance();
        this.addToken(TokenType.REGISTER, Number.parseInt(c1 + c2, 10) as Registers);
      } else {
        this.addToken(TokenType.REGISTER, Registers.R1);
      }
    } else if (c1 == 'i' && c2 == 'p') {
      this.advance();
      this.addToken(TokenType.REGISTER, Registers.RIP);
    } else if (c1 == 's' && c2 == 'p') {
      this.advance();
      this.addToken(TokenType.REGISTER, Registers.RSP);
    } else if (c1 == 'f' && c2 == 'l') {
      this.advance();
      this.addToken(TokenType.REGISTER, Registers.RFL);
    } else if (c1 == 'i' && c2 == 'n') {
      this.advance();
      this.addToken(TokenType.REGISTER, Registers.RIN);
    }
  }
}

