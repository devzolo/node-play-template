import { Token } from './Token';

export class TemplateParser {
  private len = 0;

  private nestedBracesCounter = 0;

  private end = 0;

  private begin = 0;

  private end2 = 0;

  private begin2 = 0;

  private state: Token = Token.PLAIN;

  public constructor(private pageSource: string) {
    this.pageSource = pageSource;
    this.len = pageSource.length;
  }

  private found(newState: Token, skip: number): Token {
    this.begin2 = this.begin;
    this.end2 = --this.end;
    this.begin = this.end += skip;
    const lastState: Token = this.state;
    this.state = newState;
    return lastState;
  }

  public getLine(): number {
    const token: string = this.pageSource.substring(0, this.begin2);
    if (token.indexOf('\n') === -1) {
      return 1;
    }
    return token.split('\n').length;
  }

  public getToken(): string {
    return this.pageSource.substring(this.begin2, this.end2);
  }

  public checkNext(): string {
    if (this.end2 < this.pageSource.length) {
      return `${this.pageSource.charAt(this.end2)}`;
    }
    return '';
  }

  public nextToken(): Token {
    for (;;) {
      const left: number = this.len - this.end;
      if (left === 0) {
        this.end++;
        return this.found(Token.EOF, 0);
      }

      const c: string = this.pageSource.charAt(this.end++);
      const c1: string = left > 1 ? this.pageSource.charAt(this.end) : '\0';
      const c2: string = left > 2 ? this.pageSource.charAt(this.end + 1) : '\0';

      switch (this.state) {
        case Token.PLAIN:
          if (c === '%' && c1 === '{') {
            return this.found(Token.SCRIPT, 2);
          }
          if (c === '{' && c1 === '%') {
            return this.found(Token.SCRIPT, 2);
          }
          if (c === '$' && c1 === '{') {
            this.nestedBracesCounter = 0;
            return this.found(Token.EXPR, 2);
          }
          if (c === '#' && c1 === '{' && c2 === '/') {
            return this.found(Token.END_TAG, 3);
          }
          if (c === '#' && c1 === '{') {
            this.nestedBracesCounter = 0;
            return this.found(Token.START_TAG, 2);
          }
          if (c === '&' && c1 === '{') {
            return this.found(Token.MESSAGE, 2);
          }
          if (c === '@' && c1 === '@' && c2 === '{') {
            return this.found(Token.ABS_ACTION, 3);
          }
          if (c === '@' && c1 === '{') {
            return this.found(Token.ACTION, 2);
          }
          if (c === '*' && c1 === '{') {
            return this.found(Token.COMMENT, 2);
          }
          break;
        case Token.SCRIPT:
          if (c === '}' && c1 === '%') {
            return this.found(Token.PLAIN, 2);
          }
          if (c === '%' && c1 === '}') {
            return this.found(Token.PLAIN, 2);
          }
          break;
        case Token.COMMENT:
          if (c === '}' && c1 === '*') {
            return this.found(Token.PLAIN, 2);
          }
          break;
        case Token.START_TAG:
          if (c === '}' && this.nestedBracesCounter === 0) {
            return this.found(Token.PLAIN, 1);
          }
          if (c === '/' && c1 === '}') {
            return this.found(Token.END_TAG, 1);
          }
          if (c === '{') this.nestedBracesCounter++;
          if (c === '}') this.nestedBracesCounter--;
          break;
        case Token.END_TAG:
          if (c === '}') {
            return this.found(Token.PLAIN, 1);
          }
          break;
        case Token.EXPR:
          if (c === '}' && this.nestedBracesCounter === 0) {
            return this.found(Token.PLAIN, 1);
          }
          if (c === '{') this.nestedBracesCounter++;
          if (c === '}') this.nestedBracesCounter--;
          break;
        case Token.ACTION:
          if (c === '}') {
            return this.found(Token.PLAIN, 1);
          }
          break;
        case Token.ABS_ACTION:
          if (c === '}') {
            return this.found(Token.PLAIN, 1);
          }
          break;
        case Token.MESSAGE:
          if (c === '}') {
            return this.found(Token.PLAIN, 1);
          }
          break;
        default:
          break;
      }
    }
  }

  private reset(): void {
    this.end = this.begin = this.end2 = this.begin2 = 0;
    this.state = Token.PLAIN;
  }
}
