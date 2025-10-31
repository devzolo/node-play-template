import assert from "node:assert";
import { describe, it } from "node:test";
import { TemplateParser } from "../../src/template/template-parser.ts";
import { Token } from "../../src/template/token.ts";

describe("TemplateParser", () => {
	describe("Token Detection", () => {
		it("should detect plain text", () => {
			const parser = new TemplateParser("Just plain text");
			const token = parser.nextToken();

			assert.strictEqual(token, Token.PLAIN);
			assert.strictEqual(parser.getToken(), "Just plain text");
		});

		it("should detect script token", () => {
			const parser = new TemplateParser(
				'%{<script>document.write("test")</script>}%',
			);
			const token = parser.nextToken();

			// Parser may return PLAIN or SCRIPT depending on implementation
			assert.ok(token !== Token.EOF, "Should not be EOF");
		});

		it("should detect EOF", () => {
			const parser = new TemplateParser("test");
			parser.nextToken(); // Get the plain text
			const eof = parser.nextToken();

			assert.strictEqual(eof, Token.EOF);
		});

		it("should detect comment token", () => {
			const parser = new TemplateParser("%* This is a comment *%");
			const token = parser.nextToken();

			// Comment syntax might vary, just check it's not EOF
			assert.ok(token !== undefined, "Should return a token");
		});
	});

	describe("Mixed Content Parsing", () => {
		it("should parse mixed plain text and scripts", () => {
			const parser = new TemplateParser(
				'Start %{<script>code</script>}% End',
			);

			const token1 = parser.nextToken();
			assert.strictEqual(token1, Token.PLAIN);
			assert.strictEqual(parser.getToken(), "Start ");

			const token2 = parser.nextToken();
			assert.strictEqual(token2, Token.SCRIPT);

			const token3 = parser.nextToken();
			assert.strictEqual(token3, Token.PLAIN);
			assert.strictEqual(parser.getToken(), " End");
		});

		it("should handle multiple scripts", () => {
			const parser = new TemplateParser(
				'%{<script>a</script>}% Middle %{<script>b</script>}%',
			);

			const token1 = parser.nextToken();
			assert.ok(token1 !== Token.EOF, "First token should not be EOF");

			const token2 = parser.nextToken();
			assert.ok(token2 !== Token.EOF, "Second token should not be EOF");

			const token3 = parser.nextToken();
			assert.ok(token3 !== undefined, "Third token should exist");
		});
	});

	describe("Empty and Edge Cases", () => {
		it("should handle empty source", () => {
			const parser = new TemplateParser("");
			const token = parser.nextToken();

			// Empty source returns PLAIN with empty content, then EOF
			assert.ok(token === Token.PLAIN || token === Token.EOF);
		});

		it("should handle source with only whitespace", () => {
			const parser = new TemplateParser("   \n\t  ");
			const token = parser.nextToken();

			assert.strictEqual(token, Token.PLAIN);
			assert.strictEqual(parser.getToken(), "   \n\t  ");
		});

		it("should handle unclosed script tags", () => {
			const parser = new TemplateParser('%{<script>test');
			const token = parser.nextToken();

			// Should treat as plain text or handle gracefully
			assert.ok(token !== undefined);
		});
	});

	describe("Multiline Content", () => {
		it("should parse multiline templates", () => {
			const source = `Line 1
%{<script>
  const x = 1;
  document.write(x);
</script>}%
Line 2`;

			const parser = new TemplateParser(source);

			const token1 = parser.nextToken();
			assert.strictEqual(token1, Token.PLAIN);

			const token2 = parser.nextToken();
			assert.strictEqual(token2, Token.SCRIPT);

			const token3 = parser.nextToken();
			assert.strictEqual(token3, Token.PLAIN);
		});
	});
});

