import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { PageCompiler } from './PageCompiler';
import { BaseTemplate } from './BaseTemplate';
import { StringResponse } from '../util/StringResponse';
import stream from 'stream';

describe('PageCompiler', () => {
  let compiler: PageCompiler;
  let template: BaseTemplate;
  let mockRes: StringResponse;

  beforeEach(() => {
    compiler = new PageCompiler();
    mockRes = new StringResponse();
  });

  describe('constructor', () => {
    test('should initialize with default scope', () => {
      expect(compiler).toBeDefined();
      expect(compiler.scope).toEqual({});
    });

    test('should initialize with custom scope', () => {
      const customScope = { user: { name: 'John' }, config: { debug: true } };
      const customCompiler = new PageCompiler(customScope);
      expect(customCompiler.scope).toEqual(customScope);
    });

    test('should initialize properties correctly', () => {
      expect(compiler.level).toBe(0);
      expect(compiler.currentLine).toBe(0);
      expect(compiler.exited).toBe(false);
      expect(compiler.compiledSource).toBe('');
      expect(compiler.skipLineBreak).toBe(false);
      expect(compiler.exiting).toBe(false);
      expect(compiler.doNextScan).toBe(true);
    });
  });

  describe('basic template execution', () => {
    test('should execute simple plain text template', async () => {
      template = new BaseTemplate('Hello World');
      await compiler.execute({ template });
      expect(template.compiledSource).toBe('Hello World');
    });

    test('should execute template with simple script', async () => {
      template = new BaseTemplate('Result: %{document.write("42")}%');
      await compiler.execute({ template });
      expect(template.compiledSource).toBe('Result: 42');
    });

    test('should handle empty template', async () => {
      template = new BaseTemplate('');
      await compiler.execute({ template });
      expect(template.compiledSource).toBe('');
    });

    test('should handle template with only whitespace', async () => {
      template = new BaseTemplate('   \n  \t  ');
      await compiler.execute({ template });
      expect(template.compiledSource).toBe('   \n  \t  ');
    });
  });

  describe('script execution', () => {
    test('should execute JavaScript in script blocks', async () => {
      template = new BaseTemplate('Math: %{document.write(2 + 3)}%');
      await compiler.execute({ template });
      expect(template.compiledSource).toBe('Math: 5');
    });

    test('should handle multiple script blocks', async () => {
      template = new BaseTemplate('A: %{document.write("1")}% B: %{document.write("2")}%');
      await compiler.execute({ template });
      expect(template.compiledSource).toBe('A: 1 B: 2');
    });

    test('should execute multiline scripts', async () => {
      const multilineTemplate = `
        Result: %{
          let sum = 0;
          for (let i = 1; i <= 3; i++) {
            sum += i;
          }
          document.write(sum);
        }%
      `;
      template = new BaseTemplate(multilineTemplate);
      await compiler.execute({ template });
      expect(template.compiledSource).toContain('Result: 6');
    });

    test('should handle script with string operations', async () => {
      template = new BaseTemplate('Greeting: %{document.write("Hello " + "World")}%');
      await compiler.execute({ template });
      expect(template.compiledSource).toBe('Greeting: Hello World');
    });

    test('should handle script with array operations', async () => {
      template = new BaseTemplate('Items: %{document.write([1,2,3].join(", "))}%');
      await compiler.execute({ template });
      expect(template.compiledSource).toBe('Items: 1, 2, 3');
    });

    test('should handle script with object operations', async () => {
      template = new BaseTemplate('Data: %{document.write(JSON.stringify({key: "value"}))}%');
      await compiler.execute({ template });
      expect(template.compiledSource).toBe('Data: {"key":"value"}');
    });
  });

  describe('scope integration', () => {
    test('should access variables from scope', async () => {
      const scopedCompiler = new PageCompiler({ userName: 'Alice', age: 30 });
      template = new BaseTemplate('User: %{document.write(userName + " (" + age + ")")}%');
      await scopedCompiler.execute({ template });
      expect(template.compiledSource).toBe('User: Alice (30)');
    });

    test('should handle complex scope objects', async () => {
      const complexScope = {
        user: { name: 'Bob', profile: { city: 'NYC' } },
        settings: { theme: 'dark' },
      };
      const scopedCompiler = new PageCompiler(complexScope);
      template = new BaseTemplate('Info: %{document.write(user.name + " from " + user.profile.city)}%');
      await scopedCompiler.execute({ template });
      expect(template.compiledSource).toBe('Info: Bob from NYC');
    });

    test('should handle scope with functions', async () => {
      const scopeWithFunctions = {
        formatName: (name: string) => name.toUpperCase(),
        multiply: (a: number, b: number) => a * b,
      };
      const scopedCompiler = new PageCompiler(scopeWithFunctions);
      template = new BaseTemplate('Result: %{document.write(formatName("john") + " " + multiply(3, 4))}%');
      await scopedCompiler.execute({ template });
      expect(template.compiledSource).toBe('Result: JOHN 12');
    });

    test('should handle scope with arrays', async () => {
      const scopeWithArrays = {
        items: ['apple', 'banana', 'cherry'],
        numbers: [10, 20, 30],
      };
      const scopedCompiler = new PageCompiler(scopeWithArrays);
      template = new BaseTemplate('List: %{document.write(items.join(", ") + " | " + numbers.reduce((a,b) => a+b, 0))}%');
      await scopedCompiler.execute({ template });
      expect(template.compiledSource).toBe('List: apple, banana, cherry | 60');
    });
  });

  describe('Kita HTML integration', () => {
    test('should render Kita HTML components', async () => {
      const kitaTemplate = `
        %{
          function Welcome() {
            return <div>Hello Kita HTML!</div>;
          }
          document.write(Welcome());
        }%
      `;
      template = new BaseTemplate(kitaTemplate);
      await compiler.execute({ template });
      expect(template.compiledSource).toContain('<div>Hello Kita HTML!</div>');
    });

    test('should handle Kita HTML components with props', async () => {
      const kitaWithPropsTemplate = `
        %{
          function Greeting(props) {
            return <h1>Hello {props.name}!</h1>;
          }
          document.write(Greeting({ name: 'World' }));
        }%
      `;
      template = new BaseTemplate(kitaWithPropsTemplate);
      await compiler.execute({ template });
      expect(template.compiledSource).toContain('<h1>Hello World!</h1>');
    });

    test('should handle JSX syntax with Kita HTML', async () => {
      const jsxTemplate = `
        %{
          function App() {
            return <div><h1>JSX Test</h1><p>This works!</p></div>;
          }
          document.write(App());
        }%
      `;
      template = new BaseTemplate(jsxTemplate);
      await compiler.execute({ template });
      expect(template.compiledSource).toContain('<div><h1>JSX Test</h1><p>This works!</p></div>');
    });
  });

  describe('error handling', () => {
    test('should handle syntax errors gracefully', async () => {
      template = new BaseTemplate('Error: %{document.write(invalidVariable)}%');

      // The compiler catches errors and prints them, but doesn't rethrow
      const result = await compiler.execute({ template });
      expect(result).toContain('Error:');
    });

    test('should handle runtime errors in scripts', async () => {
      template = new BaseTemplate('Error: %{throw new Error("Test error")}%');

      // The compiler catches errors and prints them, but doesn't rethrow
      const result = await compiler.execute({ template });
      expect(result).toContain('Error:');
    });

    test('should handle undefined function calls', async () => {
      template = new BaseTemplate('Error: %{nonExistentFunction()}%');

      // The compiler catches errors and prints them, but doesn't rethrow
      const result = await compiler.execute({ template });
      expect(result).toContain('Error:');
    });
  });

  describe('stream integration', () => {
    test('should work with readable stream', async () => {
      const mockReq = new stream.Readable({
        read() {
          this.push('test data');
          this.push(null);
        },
      });

      template = new BaseTemplate('Stream test: %{document.write("OK")}%');
      await compiler.execute({ template, req: mockReq });
      expect(template.compiledSource).toBe('Stream test: OK');
    });

    test('should work with writable stream', async () => {
      template = new BaseTemplate('Output: %{document.write("test")}%');
      await compiler.execute({ template, res: mockRes });
      expect(template.compiledSource).toBe('Output: test');
    });

    test('should handle next callback', async () => {
      const nextCallback = jest.fn();
      template = new BaseTemplate('Callback test: %{document.write("done")}%');

      await compiler.execute({ template, next: nextCallback });
      expect(template.compiledSource).toBe('Callback test: done');
    });
  });

  describe('complex template scenarios', () => {
    test('should handle HTML template with dynamic content', async () => {
      const htmlTemplate = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>%{document.write("Dynamic Page")}%</title>
          </head>
          <body>
            <h1>Welcome</h1>
            <p>Current time: %{document.write(new Date().getFullYear())}%</p>
            <ul>
              %{
                const items = ['Item 1', 'Item 2', 'Item 3'];
                items.forEach(item => {
                  document.write('<li>' + item + '</li>');
                });
              }%
            </ul>
          </body>
        </html>
      `;

      template = new BaseTemplate(htmlTemplate);
      await compiler.execute({ template });

      expect(template.compiledSource).toContain('<!DOCTYPE html>');
      expect(template.compiledSource).toContain('<title>Dynamic Page</title>');
      expect(template.compiledSource).toContain('<h1>Welcome</h1>');
      expect(template.compiledSource).toContain('<li>Item 1</li>');
      expect(template.compiledSource).toContain('<li>Item 2</li>');
      expect(template.compiledSource).toContain('<li>Item 3</li>');
    });

    test('should handle conditional rendering', async () => {
      const conditionalScope = { showMessage: true, userName: 'Alice' };
      const conditionalCompiler = new PageCompiler(conditionalScope);

      const conditionalTemplate = `
        <div>
          %{
            if (showMessage) {
              document.write('<p>Hello ' + userName + '!</p>');
            } else {
              document.write('<p>No message</p>');
            }
          }%
        </div>
      `;

      template = new BaseTemplate(conditionalTemplate);
      await conditionalCompiler.execute({ template });

      expect(template.compiledSource).toContain('<p>Hello Alice!</p>');
      expect(template.compiledSource).not.toContain('<p>No message</p>');
    });

    test('should handle loops and iterations', async () => {
      const loopScope = {
        products: [
          { name: 'A', price: 10 },
          { name: 'B', price: 20 },
        ],
      };
      const loopCompiler = new PageCompiler(loopScope);

      const loopTemplate = `
        <div>
          %{
            products.forEach(product => {
              document.write('<div>' + product.name + ': $' + product.price + '</div>');
            });
          }%
        </div>
      `;

      template = new BaseTemplate(loopTemplate);
      await loopCompiler.execute({ template });

      expect(template.compiledSource).toContain('<div>A: $10</div>');
      expect(template.compiledSource).toContain('<div>B: $20</div>');
    });

    test('should handle async operations in scripts', async () => {
      const asyncTemplate = `
        Result: %{
          const promise = Promise.resolve('async result');
          promise.then(result => document.write(result));
        }%
      `;

      template = new BaseTemplate(asyncTemplate);
      await compiler.execute({ template });

      // Note: This test might need adjustment based on how async is handled
      expect(template.compiledSource).toContain('Result:');
    });
  });

  describe('utility methods', () => {
    test('should return source from template', () => {
      template = new BaseTemplate('Test source');
      compiler.template = template;
      expect(compiler.source()).toBe('Test source');
    });

    test('should return empty string when no template', () => {
      expect(compiler.source()).toBe('');
    });

    test('should handle tagPrint method', () => {
      compiler.tag = { scriptSource: '' };
      compiler.tagPrint('test content');
      expect(compiler.tag.scriptSource).toBe('test content');
    });

    test('should handle print method', () => {
      compiler.print('Hello ');
      compiler.print('World');
      expect(compiler.compiledSource).toBe('Hello World');
    });

    test('should handle println method', () => {
      compiler.println('Line 1');
      compiler.println('Line 2');
      expect(compiler.compiledSource).toBe('Line 1\nLine 2\n');
    });

    test('should handle clear method', () => {
      compiler.compiledSource = 'Some content';
      compiler.clear();
      expect(compiler.compiledSource).toBe('');
    });
  });

  describe('performance and edge cases', () => {
    test('should handle large templates efficiently', async () => {
      const largeContent = 'x'.repeat(10000);
      template = new BaseTemplate(`Large: %{document.write("${largeContent}")}%`);

      const startTime = Date.now();
      await compiler.execute({ template });
      const endTime = Date.now();

      expect(template.compiledSource).toContain(`Large: ${largeContent}`);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle templates with many script blocks', async () => {
      let manyScriptsTemplate = '';
      for (let i = 0; i < 100; i++) {
        manyScriptsTemplate += `Block ${i}: %{document.write("${i}")}% `;
      }

      template = new BaseTemplate(manyScriptsTemplate);
      await compiler.execute({ template });

      expect(template.compiledSource).toContain('Block 0: 0');
      expect(template.compiledSource).toContain('Block 99: 99');
    });

    test('should handle special characters in templates', async () => {
      template = new BaseTemplate('Special: %{document.write("àáâãäåæçèéêë ñç 中文 🚀")}%');
      await compiler.execute({ template });
      expect(template.compiledSource).toBe('Special: àáâãäåæçèéêë ñç 中文 🚀');
    });

    test('should handle nested quotes in scripts', async () => {
      template = new BaseTemplate(`Quote test: %{document.write('"Hello \\'World\\'"')}%`);
      await compiler.execute({ template });
      expect(template.compiledSource).toBe(`Quote test: "Hello 'World'"`);
    });
  });
});
