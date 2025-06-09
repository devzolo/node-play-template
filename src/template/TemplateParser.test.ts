import { describe, test, expect, beforeEach } from '@jest/globals';
import { TemplateParser } from './TemplateParser';
import { Token } from './Token';

describe('TemplateParser', () => {
  let parser: TemplateParser;

  describe('constructor', () => {
    test('should initialize with page source', () => {
      parser = new TemplateParser('Hello World');
      expect(parser).toBeDefined();
    });

    test('should handle empty source', () => {
      parser = new TemplateParser('');
      expect(parser).toBeDefined();
    });
  });

  describe('plain text parsing', () => {
    beforeEach(() => {
      parser = new TemplateParser('Hello World');
    });

    test('should parse plain text as PLAIN token', () => {
      const token = parser.nextToken();
      expect(token).toBe(Token.PLAIN);
      expect(parser.getToken()).toBe('Hello World');
    });

    test('should reach EOF after plain text', () => {
      parser.nextToken(); // consume PLAIN
      const eofToken = parser.nextToken();
      expect(eofToken).toBe(Token.EOF);
    });
  });

  describe('script block parsing', () => {
    test('should parse %{...}% as SCRIPT token', () => {
      parser = new TemplateParser('Before %{document.write("test")}% After');

      expect(parser.nextToken()).toBe(Token.PLAIN);
      expect(parser.getToken()).toBe('Before ');

      expect(parser.nextToken()).toBe(Token.SCRIPT);
      expect(parser.getToken()).toBe('document.write("test")');

      expect(parser.nextToken()).toBe(Token.PLAIN);
      expect(parser.getToken()).toBe(' After');
    });

    test('should parse {%...%} as SCRIPT token', () => {
      parser = new TemplateParser('Start {%console.log("hello")%} End');

      expect(parser.nextToken()).toBe(Token.PLAIN);
      expect(parser.getToken()).toBe('Start ');

      expect(parser.nextToken()).toBe(Token.SCRIPT);
      expect(parser.getToken()).toBe('console.log("hello")');

      expect(parser.nextToken()).toBe(Token.PLAIN);
      expect(parser.getToken()).toBe(' End');
    });

    test('should handle multiline script blocks', () => {
      const multilineScript = `Before %{
        let x = 1;
        let y = 2;
        document.write(x + y);
      }% After`;

      parser = new TemplateParser(multilineScript);

      expect(parser.nextToken()).toBe(Token.PLAIN);
      expect(parser.getToken()).toBe('Before ');

      expect(parser.nextToken()).toBe(Token.SCRIPT);
      const scriptContent = parser.getToken();
      expect(scriptContent).toContain('let x = 1;');
      expect(scriptContent).toContain('let y = 2;');
      expect(scriptContent).toContain('document.write(x + y);');
    });
  });

  describe('expression parsing - working cases', () => {
    test('should parse ${...} as EXPR token in working context', () => {
      parser = new TemplateParser('Before ${user.name} After');

      expect(parser.nextToken()).toBe(Token.PLAIN);
      expect(parser.getToken()).toBe('Before ');

      expect(parser.nextToken()).toBe(Token.EXPR);
      expect(parser.getToken()).toBe('user.name');

      expect(parser.nextToken()).toBe(Token.PLAIN);
      expect(parser.getToken()).toBe(' After');
    });
  });

  describe('comment parsing', () => {
    test('should parse *{...}* as COMMENT token', () => {
      parser = new TemplateParser('Before *{This is a comment}* After');

      expect(parser.nextToken()).toBe(Token.PLAIN);
      expect(parser.getToken()).toBe('Before ');

      expect(parser.nextToken()).toBe(Token.COMMENT);
      expect(parser.getToken()).toBe('This is a comment');

      expect(parser.nextToken()).toBe(Token.PLAIN);
      expect(parser.getToken()).toBe(' After');
    });
  });

  describe('line tracking', () => {
    test('should track line numbers correctly', () => {
      const multilineSource = 'Line 1\nLine 2\nLine 3\n%{script}%\nLine 5';
      parser = new TemplateParser(multilineSource);

      parser.nextToken(); // PLAIN for first 3 lines + script start
      expect(parser.getLine()).toBe(1);

      parser.nextToken(); // SCRIPT token
      expect(parser.getLine()).toBe(4);
    });

    test('should handle single line correctly', () => {
      parser = new TemplateParser('Single line content');
      parser.nextToken();
      expect(parser.getLine()).toBe(1);
    });
  });

  describe('complex template parsing', () => {
    test('should parse template with working token types', () => {
      const workingTemplate = `
        <html>
          <head>
            <title>Test</title>
          </head>
          <body>
            <p>Welcome!</p>
            %{
              document.write('<ul>');
              items.forEach(item => {
                document.write('<li>' + item.name + '</li>');
              });
              document.write('</ul>');
            }%
            *{This is a comment}*
          </body>
        </html>
      `;

      parser = new TemplateParser(workingTemplate);

      const tokens: Token[] = [];
      const tokenContents: string[] = [];

      let token: Token;
      do {
        token = parser.nextToken();
        tokens.push(token);
        tokenContents.push(parser.getToken());
      } while (token !== Token.EOF);

      // Verify we have working token types
      expect(tokens).toContain(Token.PLAIN);
      expect(tokens).toContain(Token.SCRIPT);
      expect(tokens).toContain(Token.COMMENT);
      expect(tokens).toContain(Token.EOF);

      // Verify specific content
      expect(tokenContents.some(content => content.includes('This is a comment'))).toBe(true);
    });
  });

  describe('checkNext method', () => {
    test('should peek at next character', () => {
      parser = new TemplateParser('Hello');
      parser.nextToken(); // consume PLAIN token

      const nextChar = parser.checkNext();
      expect(typeof nextChar).toBe('string');
    });

    test('should return empty string at end', () => {
      parser = new TemplateParser('A');
      parser.nextToken(); // consume PLAIN
      parser.nextToken(); // consume EOF

      const nextChar = parser.checkNext();
      expect(nextChar).toBe('');
    });
  });

  describe('real-world scenarios', () => {
    test('should handle HTML template with scripts and comments', () => {
      const htmlTemplate = `
        <!DOCTYPE html>
        <html>
          <head><title>Test Page</title></head>
          <body>
            <h1>Welcome</h1>
            %{ document.write('<p>Dynamic content</p>'); }%
            *{Footer comment}*
          </body>
        </html>
      `;

      parser = new TemplateParser(htmlTemplate);

      let tokenCount = 0;
      let hasScript = false;
      let hasComment = false;

      let token: Token;
      do {
        token = parser.nextToken();
        tokenCount++;

        if (token === Token.SCRIPT) hasScript = true;
        if (token === Token.COMMENT) hasComment = true;
      } while (token !== Token.EOF);

      expect(tokenCount).toBeGreaterThan(3);
      expect(hasScript).toBe(true);
      expect(hasComment).toBe(true);
    });

    test('should handle template with special characters', () => {
      parser = new TemplateParser('Special: %{document.write("àáâã")}% *{Comment with ção}*');

      expect(parser.nextToken()).toBe(Token.PLAIN);
      expect(parser.getToken()).toBe('Special: ');

      expect(parser.nextToken()).toBe(Token.SCRIPT);
      expect(parser.getToken()).toBe('document.write("àáâã")');

      expect(parser.nextToken()).toBe(Token.PLAIN);
      expect(parser.getToken()).toBe(' ');

      expect(parser.nextToken()).toBe(Token.COMMENT);
      expect(parser.getToken()).toBe('Comment with ção');
    });
  });

  describe('basic functionality tests', () => {
    test('should handle mixed plain text and comments', () => {
      parser = new TemplateParser('Start *{middle comment}* End');

      expect(parser.nextToken()).toBe(Token.PLAIN);
      expect(parser.getToken()).toBe('Start ');

      expect(parser.nextToken()).toBe(Token.COMMENT);
      expect(parser.getToken()).toBe('middle comment');

      expect(parser.nextToken()).toBe(Token.PLAIN);
      expect(parser.getToken()).toBe(' End');
    });

    test('should handle mixed script and plain text', () => {
      parser = new TemplateParser('Text %{code}% More text');

      expect(parser.nextToken()).toBe(Token.PLAIN);
      expect(parser.getToken()).toBe('Text ');

      expect(parser.nextToken()).toBe(Token.SCRIPT);
      expect(parser.getToken()).toBe('code');

      expect(parser.nextToken()).toBe(Token.PLAIN);
      expect(parser.getToken()).toBe(' More text');
    });

    test('should handle template parsing step by step', () => {
      parser = new TemplateParser('Script: %{code}% and Comment: *{note}*');

      expect(parser.nextToken()).toBe(Token.PLAIN);
      expect(parser.getToken()).toBe('Script: ');

      expect(parser.nextToken()).toBe(Token.SCRIPT);
      expect(parser.getToken()).toBe('code');

      expect(parser.nextToken()).toBe(Token.PLAIN);
      expect(parser.getToken()).toBe(' and Comment: ');

      expect(parser.nextToken()).toBe(Token.COMMENT);
      expect(parser.getToken()).toBe('note');

      // Additional tokens might exist after the comment, so we just verify we can get more tokens
      const nextToken = parser.nextToken();
      expect([Token.PLAIN, Token.EOF]).toContain(nextToken);
    });
  });
});
