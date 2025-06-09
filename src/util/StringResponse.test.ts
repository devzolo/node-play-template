import { describe, test, expect, beforeEach } from '@jest/globals';
import { StringResponse } from './StringResponse';
import { Writable } from 'stream';

describe('StringResponse', () => {
  let response: StringResponse;

  beforeEach(() => {
    response = new StringResponse();
  });

  describe('constructor', () => {
    test('should initialize with empty data', () => {
      expect(response.data).toBe('');
    });

    test('should be instance of Writable stream', () => {
      expect(response).toBeInstanceOf(Writable);
    });
  });

  describe('_write method', () => {
    test('should write string data', done => {
      const testData = 'Hello World';

      response._write(testData, 'utf8', error => {
        expect(error).toBeUndefined();
        expect(response.data).toBe(testData);
        done();
      });
    });

    test('should write buffer data', done => {
      const testData = Buffer.from('Hello Buffer', 'utf8');

      response._write(testData, 'utf8', error => {
        expect(error).toBeUndefined();
        expect(response.data).toBe('Hello Buffer');
        done();
      });
    });

    test('should append multiple writes', done => {
      response._write('First ', 'utf8', () => {
        response._write('Second', 'utf8', error => {
          expect(error).toBeUndefined();
          expect(response.data).toBe('First Second');
          done();
        });
      });
    });

    test('should handle different encodings', done => {
      const testData = 'Héllo Wörld';

      response._write(testData, 'utf8', error => {
        expect(error).toBeUndefined();
        expect(response.data).toBe(testData);
        done();
      });
    });

    test('should handle empty writes', done => {
      response._write('', 'utf8', error => {
        expect(error).toBeUndefined();
        expect(response.data).toBe('');
        done();
      });
    });

    test('should handle numeric data', done => {
      response._write(123, 'utf8', error => {
        expect(error).toBeUndefined();
        expect(response.data).toBe('123');
        done();
      });
    });

    test('should handle object data', done => {
      const obj = { toString: () => 'custom object' };

      response._write(obj, 'utf8', error => {
        expect(error).toBeUndefined();
        expect(response.data).toBe('custom object');
        done();
      });
    });
  });

  describe('data getter', () => {
    test('should return accumulated data', () => {
      response.data = 'test data';
      expect(response.data).toBe('test data');
    });

    test('should return empty string initially', () => {
      expect(response.data).toBe('');
    });
  });

  describe('data setter', () => {
    test('should set data directly', () => {
      response.data = 'new data';
      expect(response.data).toBe('new data');
    });

    test('should overwrite existing data', () => {
      response.data = 'initial';
      response.data = 'overwritten';
      expect(response.data).toBe('overwritten');
    });

    test('should handle empty string', () => {
      response.data = 'something';
      response.data = '';
      expect(response.data).toBe('');
    });

    test('should handle special characters', () => {
      const specialData = 'àáâãäåæçèéêë ñç 中文 🚀';
      response.data = specialData;
      expect(response.data).toBe(specialData);
    });
  });

  describe('stream integration', () => {
    test('should work with write method', done => {
      response.write('Hello ');
      response.write('World', () => {
        expect(response.data).toBe('Hello World');
        done();
      });
    });

    test('should work with end method', done => {
      response.write('Test data');
      response.end(() => {
        expect(response.data).toBe('Test data');
        done();
      });
    });

    test('should handle write with callback', done => {
      response.write('Callback test', error => {
        expect(error).toBeNull();
        expect(response.data).toBe('Callback test');
        done();
      });
    });

    test('should handle multiple writes in sequence', done => {
      response.write('Part 1 ');
      response.write('Part 2 ');
      response.write('Part 3', () => {
        expect(response.data).toBe('Part 1 Part 2 Part 3');
        done();
      });
    });
  });

  describe('real-world scenarios', () => {
    test('should handle HTML content', done => {
      const htmlContent = '<html><head><title>Test</title></head><body><h1>Hello</h1></body></html>';

      response.write(htmlContent, () => {
        expect(response.data).toBe(htmlContent);
        expect(response.data).toContain('<title>Test</title>');
        expect(response.data).toContain('<h1>Hello</h1>');
        done();
      });
    });

    test('should handle JSON data', done => {
      const jsonData = JSON.stringify({ name: 'John', age: 30, active: true });

      response.write(jsonData, () => {
        expect(response.data).toBe(jsonData);
        const parsed = JSON.parse(response.data);
        expect(parsed.name).toBe('John');
        expect(parsed.age).toBe(30);
        expect(parsed.active).toBe(true);
        done();
      });
    });

    test('should handle large data chunks', done => {
      const largeData = 'x'.repeat(100000);

      response.write(largeData, () => {
        expect(response.data).toBe(largeData);
        expect(response.data.length).toBe(100000);
        done();
      });
    });

    test('should handle template compilation output', done => {
      // Simulate template compilation output
      response.write('<!DOCTYPE html>\n');
      response.write('<html>\n');
      response.write('  <head><title>Dynamic Page</title></head>\n');
      response.write('  <body>\n');
      response.write('    <h1>Welcome John!</h1>\n');
      response.write('    <p>Current year: 2024</p>\n');
      response.write('  </body>\n');
      response.write('</html>', () => {
        const expectedOutput = `<!DOCTYPE html>
<html>
  <head><title>Dynamic Page</title></head>
  <body>
    <h1>Welcome John!</h1>
    <p>Current year: 2024</p>
  </body>
</html>`;
        expect(response.data).toBe(expectedOutput);
        done();
      });
    });

    test('should handle mixed content types', done => {
      response.write('Text: ');
      response.write(Buffer.from('Buffer content ', 'utf8'));
      response.write('42'); // Convert number to string
      response.write(' End', () => {
        expect(response.data).toBe('Text: Buffer content 42 End');
        done();
      });
    });
  });

  describe('error handling', () => {
    test('should handle null data gracefully', done => {
      response._write(null, 'utf8', error => {
        expect(error).toBeUndefined();
        expect(response.data).toBe('null');
        done();
      });
    });

    test('should handle undefined data gracefully', done => {
      response._write(undefined, 'utf8', error => {
        expect(error).toBeUndefined();
        expect(response.data).toBe('undefined');
        done();
      });
    });

    test('should handle boolean data', done => {
      response._write(true, 'utf8', () => {
        response._write(false, 'utf8', error => {
          expect(error).toBeUndefined();
          expect(response.data).toBe('truefalse');
          done();
        });
      });
    });
  });

  describe('performance', () => {
    test('should handle many small writes efficiently', done => {
      const startTime = Date.now();
      let writeCount = 0;
      const totalWrites = 1000;

      const writeNext = () => {
        if (writeCount < totalWrites) {
          response.write(`chunk${writeCount} `, () => {
            writeCount++;
            writeNext();
          });
        } else {
          const endTime = Date.now();
          expect(response.data).toContain('chunk0 ');
          expect(response.data).toContain(`chunk${totalWrites - 1} `);
          expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
          done();
        }
      };

      writeNext();
    });

    test('should handle rapid successive writes', done => {
      for (let i = 0; i < 100; i++) {
        response.write(`${i} `);
      }

      // Give it a moment to process
      setTimeout(() => {
        expect(response.data).toContain('0 ');
        expect(response.data).toContain('99 ');
        expect(response.data.split(' ').length).toBe(101); // 100 numbers + 1 empty string at end
        done();
      }, 10);
    });
  });

  describe('edge cases', () => {
    test('should handle data reset after writes', done => {
      response.write('Initial data', () => {
        expect(response.data).toBe('Initial data');

        response.data = '';
        expect(response.data).toBe('');

        response.write('New data', () => {
          expect(response.data).toBe('New data');
          done();
        });
      });
    });

    test('should handle concurrent access to data property', () => {
      response.data = 'initial';
      const data1 = response.data;
      response.data = 'modified';
      const data2 = response.data;

      expect(data1).toBe('initial');
      expect(data2).toBe('modified');
    });

    test('should maintain data integrity across operations', done => {
      response.write('Start ');

      setTimeout(() => {
        response.write('Middle ');

        setTimeout(() => {
          response.write('End', () => {
            expect(response.data).toBe('Start Middle End');
            done();
          });
        }, 5);
      }, 5);
    });
  });
});
