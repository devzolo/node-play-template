import { describe, test, expect } from '@jest/globals';
import { TemplateCompilerError } from './TemplateCompilerError';

describe('TemplateCompilerError', () => {
  test('should create an error with the correct message', () => {
    const error = new TemplateCompilerError(new Error('Test error'));
    expect(error.message).toBe('Test error');
  });
});
