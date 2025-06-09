import { describe, test, expect, beforeEach } from '@jest/globals';
import { BaseTemplate } from './BaseTemplate';

describe('BaseTemplate', () => {
  let template: BaseTemplate;

  beforeEach(() => {
    template = new BaseTemplate('Hello %{document.write("World")}%');
  });

  describe('constructor', () => {
    test('should initialize with source code when only path provided', () => {
      expect(template.getSource()).toBe('Hello %{document.write("World")}%');
      expect(template.compiledSource).toBe('');
      expect(template.name).toBeDefined();
      expect(template.path).toBe('Hello %{document.write("World")}%');
    });

    test('should initialize with path, name and source', () => {
      const testTemplate = new BaseTemplate('/path/to/template', 'my-template', '<html>Test</html>');
      expect(testTemplate.path).toBe('/path/to/template');
      expect(testTemplate.name).toBe('my-template');
      expect(testTemplate.getSource()).toBe('<html>Test</html>');
    });

    test('should handle empty source', () => {
      const emptyTemplate = new BaseTemplate('');
      expect(emptyTemplate.getSource()).toBe('');
    });

    test('should handle multiline source', () => {
      const multilineSource = `
        <html>
          <head><title>Test</title></head>
          <body>
            %{document.write("Hello World")}%
          </body>
        </html>
      `;
      const multilineTemplate = new BaseTemplate(multilineSource);
      expect(multilineTemplate.getSource()).toBe(multilineSource);
    });

    test('should generate UUID name when not provided', () => {
      const template1 = new BaseTemplate('test1');
      const template2 = new BaseTemplate('test2');
      expect(template1.name).toBeDefined();
      expect(template2.name).toBeDefined();
      expect(template1.name).not.toBe(template2.name);
      expect(template1.name.length).toBe(36); // UUID length
    });
  });

  describe('name property', () => {
    test('should allow setting custom name', () => {
      const customTemplate = new BaseTemplate('/path', 'custom-name', 'source');
      expect(customTemplate.name).toBe('custom-name');
    });

    test('should handle special characters in name', () => {
      const specialTemplate = new BaseTemplate('/path', 'template-with-special-chars_123.html', 'source');
      expect(specialTemplate.name).toBe('template-with-special-chars_123.html');
    });
  });

  describe('source management', () => {
    test('should set and get source', () => {
      template.setSource('<div>New content</div>');
      expect(template.getSource()).toBe('<div>New content</div>');
    });

    test('should handle HTML content in source', () => {
      const htmlContent = '<html><head><title>Test</title></head><body><h1>Hello</h1></body></html>';
      template.setSource(htmlContent);
      expect(template.getSource()).toBe(htmlContent);
    });

    test('should handle special characters in source', () => {
      const specialContent = 'Special chars: àáâãäåæçèéêë ñç';
      template.setSource(specialContent);
      expect(template.getSource()).toBe(specialContent);
    });
  });

  describe('compilation properties', () => {
    test('should initialize with empty compiled source', () => {
      expect(template.compiledSource).toBe('');
      expect(template.getCompiledSource()).toBe('');
    });

    test('should maintain compiled source property', () => {
      template.compiledSource = 'Compiled content';
      expect(template.getCompiledSource()).toBe('Compiled content');
    });

    test('should have timestamp property', () => {
      expect(template.timestamp).toBeDefined();
      expect(typeof template.timestamp).toBe('number');
      expect(template.timestamp).toBeGreaterThan(0);
    });

    test('should have linesMatrix array', () => {
      expect(Array.isArray(template.linesMatrix)).toBe(true);
      expect(template.linesMatrix.length).toBe(0);
    });
  });

  describe('getCompiledBytes', () => {
    test('should return compiled source as bytes', () => {
      template.compiledSource = 'Test content';
      expect(template.getCompiledBytes()).toBe('Test content');
    });

    test('should handle empty compiled source', () => {
      expect(template.getCompiledBytes()).toBe('');
    });
  });

  describe('finalize', () => {
    test('should clear source when finalized', () => {
      template.setSource('Initial source');
      expect(template.getSource()).toBe('Initial source');

      template.finalize();
      expect(template.getSource()).toBe('');
    });

    test('should handle finalize with null source', () => {
      template.setSource('');
      template.finalize();
      expect(template.getSource()).toBe('');
    });
  });

  describe('integration scenarios', () => {
    test('should handle complex template lifecycle', () => {
      const complexTemplate = new BaseTemplate(
        '/templates/complex.html',
        'complex-template',
        `
        <html>
          <head>
            <title>%{document.write("Dynamic Title")}%</title>
          </head>
          <body>
            <h1>%{document.write("Welcome")}%</h1>
            <p>Current time: %{document.write(new Date().toISOString())}%</p>
          </body>
        </html>
        `
      );

      expect(complexTemplate.path).toBe('/templates/complex.html');
      expect(complexTemplate.name).toBe('complex-template');
      expect(complexTemplate.getSource()).toContain('Dynamic Title');
      expect(complexTemplate.compiledSource).toBe('');

      // Simulate compilation
      complexTemplate.compiledSource = '<html><head><title>Dynamic Title</title></head><body><h1>Welcome</h1></body></html>';
      expect(complexTemplate.getCompiledSource()).toContain('Dynamic Title');
    });

    test('should preserve path and name relationship', () => {
      const template1 = new BaseTemplate('/path/file1.html', 'template1', 'content1');
      const template2 = new BaseTemplate('/path/file2.html', 'template2', 'content2');

      expect(template1.path).not.toBe(template2.path);
      expect(template1.name).not.toBe(template2.name);
      expect(template1.getSource()).not.toBe(template2.getSource());
    });

    test('should handle template reuse', () => {
      const originalSource = '<div>Original</div>';
      template.setSource(originalSource);

      const newSource = '<div>Updated</div>';
      template.setSource(newSource);

      expect(template.getSource()).toBe(newSource);
    });
  });
});
