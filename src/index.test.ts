import { describe, test, expect } from '@jest/globals';

describe('Main module exports', () => {
  test('should export all template classes and utilities', async () => {
    const mainModule = await import('./index');

    // Verify template exports
    expect(mainModule.BaseTemplate).toBeDefined();
    expect(mainModule.PageCompiler).toBeDefined();
    expect(mainModule.TemplateParser).toBeDefined();
    expect(mainModule.TemplateCompiler).toBeDefined();
    expect(mainModule.Template).toBeDefined();
    expect(mainModule.Token).toBeDefined();

    // Verify utility exports
    expect(mainModule.StringResponse).toBeDefined();
  });

  test('should allow creating template instances from exports', async () => {
    const { BaseTemplate, PageCompiler, StringResponse } = await import('./index');

    const template = new BaseTemplate('Test template');
    const compiler = new PageCompiler();
    const response = new StringResponse();

    expect(template).toBeDefined();
    expect(compiler).toBeDefined();
    expect(response).toBeDefined();
  });

  test('should support complete template compilation workflow', async () => {
    const { BaseTemplate, PageCompiler } = await import('./index');

    const template = new BaseTemplate('Hello %{document.write("World")}%');
    const compiler = new PageCompiler();

    await compiler.execute({ template });

    expect(template.compiledSource).toBe('Hello World');
  });

  test('should support template with scope variables', async () => {
    const { BaseTemplate, PageCompiler } = await import('./index');

    const scope = { userName: 'Alice', greeting: 'Hello' };
    const template = new BaseTemplate('Message: %{document.write(greeting + " " + userName)}%');
    const compiler = new PageCompiler(scope);

    await compiler.execute({ template });

    expect(template.compiledSource).toBe('Message: Hello Alice');
  });

  test('should support Kita HTML component rendering', async () => {
    const { BaseTemplate, PageCompiler } = await import('./index');

    const kitaTemplate = new BaseTemplate(`
      %{
        function Welcome() {
          return <div>Hello Kita HTML!</div>;
        }
        document.write(Welcome());
      }%
    `);
    const compiler = new PageCompiler();

    await compiler.execute({ template: kitaTemplate });

    expect(kitaTemplate.compiledSource).toContain('<div>Hello Kita HTML!</div>');
  });

  test('should support StringResponse for capturing output', async () => {
    const { BaseTemplate, PageCompiler, StringResponse } = await import('./index');

    const template = new BaseTemplate('Output: %{document.write("test data")}%');
    const compiler = new PageCompiler();
    const response = new StringResponse();

    await compiler.execute({ template, res: response });

    expect(template.compiledSource).toBe('Output: test data');
    expect(response.data).toBe('Output: test data');
  });

  test('should handle complex template with multiple features', async () => {
    const { BaseTemplate, PageCompiler } = await import('./index');

    const complexScope = {
      user: { name: 'John', age: 30 },
      items: ['apple', 'banana', 'cherry'],
      formatName: (name: string) => name.toUpperCase(),
    };

    const complexTemplate = new BaseTemplate(`
      <html>
        <head>
          <title>User Profile</title>
        </head>
        <body>
          <h1>Welcome %{document.write(formatName(user.name))}%!</h1>
          <p>Age: %{document.write(user.age)}%</p>
          <ul>
            %{
              items.forEach(item => {
                document.write('<li>' + item + '</li>');
              });
            }%
          </ul>
          %{
            function UserCard() {
              return <div className="card">
                <p>User card for {user.name}</p>  
              </div>;
            }
            document.write(UserCard());
          }%
        </body>
      </html>
    `);

    const compiler = new PageCompiler(complexScope);
    await compiler.execute({ template: complexTemplate });

    const result = complexTemplate.compiledSource;

    expect(result).toContain('<title>User Profile</title>');
    expect(result).toContain('<h1>Welcome JOHN!</h1>');
    expect(result).toContain('<p>Age: 30</p>');
    expect(result).toContain('<li>apple</li>');
    expect(result).toContain('<li>banana</li>');
    expect(result).toContain('<li>cherry</li>');
    expect(result).toContain('<div class="card">');
    expect(result).toContain('User card for John');
  });

  test('should handle error scenarios gracefully', async () => {
    const { BaseTemplate, PageCompiler } = await import('./index');

    const errorTemplate = new BaseTemplate('Error: %{document.write(undefinedVariable)}%');
    const compiler = new PageCompiler();

    // The compiler catches errors and prints them, but doesn't rethrow
    const result = await compiler.execute({ template: errorTemplate });
    expect(result).toContain('Error:');
  });

  test('should support template parsing with working token types', async () => {
    const { TemplateParser, Token } = await import('./index');

    const workingTemplate = `
      Plain text
      %{script block}%
      \${expression}
      *{comment}*
    `;

    const parser = new TemplateParser(workingTemplate);
    const tokens: any[] = [];

    let token: any;
    do {
      token = parser.nextToken();
      tokens.push(token);
    } while (token !== Token.EOF);

    expect(tokens).toContain(Token.PLAIN);
    expect(tokens).toContain(Token.SCRIPT);
    expect(tokens).toContain(Token.EXPR);
    expect(tokens).toContain(Token.COMMENT);
    expect(tokens).toContain(Token.EOF);
  });
});
