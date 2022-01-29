import {Registers} from '../../core';
import {AsmErrorCollector} from '../base';

export enum TokenType {
  COMMA,
  COLON,

  IDENTIFIER,
  REGISTER,
  STRING,
  NUMBER,

  NOP,
  END,
  VSYNC,

  MOVI,

  JMPI,

  EOF,
}

const Keywords: Map<string, TokenType> = new Map(Object.entries({
  'NOP': TokenType.NOP,
  'END': TokenType.END,
  'VSYNC': TokenType.VSYNC,
  
  'MOVI': TokenType.MOVI,

  'JMPI': TokenType.JMPI,
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

export function tokenize(source: string, collectError: AsmErrorCollector): Token[] {
  return new Tokenizer(source, collectError).tokenize();
}

class Tokenizer {
  private readonly source: string;
  private readonly collectError: AsmErrorCollector;
  private readonly tokens: Token[];
  private start: number;
  private current: number;
  private line: number;

  constructor(source: string, collectError: AsmErrorCollector) {
    this.source = source;
    this.collectError = collectError;
    this.tokens = [];
    this.start = 0;
    this.current = 0;
    this.line = 1;
  }

  tokenize(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push({
      type: TokenType.EOF,
      lexeme: '',
      line: this.line,
    });

    return this.tokens;
  }

  private isAtEnd(ahead: number = 0): boolean {
    return this.current + ahead >= this.source.length;
  }

  private scanToken() {
    const c = this.advance();
    switch (c) {
      case ',':
        this.addToken(TokenType.COMMA);
        break;
      case ':':
        this.addToken(TokenType.COLON);
        break;
      case '/':
        if (this.match('/')) {
          while (this.peek() != '\n' && !this.isAtEnd()) {
            this.advance();
          }
        } else if (this.match('*')) {
          const line = this.line;
          while (this.peek() != '*' && this.peek(1) != '/' && !this.isAtEnd()) {
            const cc = this.advance();
            if (cc == '\n') {
              this.line++;
            }
          }
          if (this.isAtEnd()) {
            this.collectError({
              line,
              message: `Could not find closing comment section`,
            })
          }
        } else {
          this.collectError({
            line: this.line,
            message: `Unexpected character: '${c}`,
          });
        }
        break;
      case ' ':
      case '\r':
      case '\t':
        break;
      case '\n':
        this.line++;
        break;
      case '"':
        this.string();
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
          this.collectError({
            line: this.line,
            message: `Unexpected character: '${c}'`,
          });
        }
        break;
    }
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

  private string() {
    while (this.peek() != '"' && !this.isAtEnd()) {
      if (this.peek() == '\n') {
        this.line++;
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      this.collectError({
        line: this.line,
        message: 'Unterminated string',
      });
    }

    this.advance();
    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
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
      this.addToken(TokenType.IDENTIFIER);
    }
  }

  private isRegister(c: string): boolean {
    if (c != 'R') {
      return false;
    }

    const c1 = this.peek();
    const c2 = this.peek(1);

    return (c1 >= '0' && c1 <= '9') ||
        (c1 == '1' && c2 >= '0' && c2 <= '5') ||
        (c1 == 'I' && c2 == 'P') ||
        (c1 == 'S' && c2 == 'P') ||
        (c1 == 'F' && c2 == 'L') ||
        (c1 == 'I' && c2 == 'N');
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
    } else if (c1 == 'I' && c2 == 'P') {
      this.advance();
      this.addToken(TokenType.REGISTER, Registers.RIP);
    } else if (c1 == 'S' && c2 == 'P') {
      this.advance();
      this.addToken(TokenType.REGISTER, Registers.RSP);
    } else if (c1 == 'F' && c2 == 'L') {
      this.advance();
      this.addToken(TokenType.REGISTER, Registers.RFL);
    } else if (c1 == 'I' && c2 == 'N') {
      this.advance();
      this.addToken(TokenType.REGISTER, Registers.RIN);
    }
  }
}

