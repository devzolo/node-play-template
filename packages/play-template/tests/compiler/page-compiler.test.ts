import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { BaseTemplate, PageCompiler } from "../../src/template/index.ts";

describe("PageCompiler", () => {
	describe("Basic Compilation", () => {
		it("should compile simple script with document.write", async () => {
			const template = new BaseTemplate(
				'test = %{<script>document.write("test")</script>}%',
			);
			const compiler = new PageCompiler();

			await compiler.execute({ template });

			assert.strictEqual(template.compiledSource, "test = test");
		});

		it("should compile script from fixture file", async () => {
			const source = fs.readFileSync(
				path.join(import.meta.dirname, "../fixtures/simple-script.xhtml"),
				{ encoding: "utf8" },
			);

			const template = new BaseTemplate(source.trim());
			const compiler = new PageCompiler();

			await compiler.execute({ template });

			assert.strictEqual(template.compiledSource, "test = test");
		});

		it("should handle plain text without scripts", async () => {
			const plainText = "Just plain text";
			const template = new BaseTemplate(plainText);
			const compiler = new PageCompiler();

			await compiler.execute({ template });

			assert.strictEqual(template.compiledSource, plainText);
		});
	});

	describe("JSON Output", () => {
		it("should generate JSON output", async () => {
			const source = fs.readFileSync(
				path.join(import.meta.dirname, "../fixtures/json-output.xhtml"),
				{ encoding: "utf8" },
			);

			const template = new BaseTemplate(source.trim());
			const compiler = new PageCompiler();

			await compiler.execute({ template });

			assert.strictEqual(template.compiledSource, '{"hello":"world"}');
		});

		it("should handle complex JSON structures", async () => {
			const template = new BaseTemplate(
				'%{<script>document.write(JSON.stringify({ a: 1, b: [2, 3], c: { d: 4 } }))</script>}%',
			);
			const compiler = new PageCompiler();

			await compiler.execute({ template });

			const result = JSON.parse(template.compiledSource);
			assert.deepStrictEqual(result, { a: 1, b: [2, 3], c: { d: 4 } });
		});
	});

	describe("Scope Management", () => {
		it("should pass variables through scope", async () => {
			const template = new BaseTemplate(
				'%{<script>document.write(userName)</script>}%',
			);
			const compiler = new PageCompiler({ userName: "John" });

			await compiler.execute({ template });

			assert.strictEqual(template.compiledSource, "John");
		});

		it("should handle multiple scope variables", async () => {
			const template = new BaseTemplate(
				'%{<script>document.write(`${firstName} ${lastName}`)</script>}%',
			);
			const compiler = new PageCompiler({
				firstName: "John",
				lastName: "Doe",
			});

			await compiler.execute({ template });

			assert.strictEqual(template.compiledSource, "John Doe");
		});

		it("should handle numeric scope variables", async () => {
			const template = new BaseTemplate(
				'%{<script>document.write(count * 2)</script>}%',
			);
			const compiler = new PageCompiler({ count: 5 });

			await compiler.execute({ template });

			assert.strictEqual(template.compiledSource, "10");
		});
	});

	describe("Error Handling", () => {
		it("should handle errors in script execution", async () => {
			const template = new BaseTemplate(
				'%{<script>throw new Error("Test error")</script>}%',
			);
			const compiler = new PageCompiler();

			let errorCaught = false;
			const next = (err?: Error) => {
				if (err) errorCaught = true;
			};

			await compiler.execute({ template, next });

			assert.strictEqual(errorCaught, true);
		});

		it("should handle undefined variables gracefully", async () => {
			const template = new BaseTemplate(
				'%{<script>document.write(typeof undefinedVar)</script>}%',
			);
			const compiler = new PageCompiler();

			await compiler.execute({ template });

			assert.strictEqual(template.compiledSource, "undefined");
		});
	});

	describe("Async Operations", () => {
		it("should handle async operations in scripts", async () => {
			const template = new BaseTemplate(
				'%{<script>const result = await Promise.resolve("async"); document.write(result)</script>}%',
			);
			const compiler = new PageCompiler();

			await compiler.execute({ template });

			assert.strictEqual(template.compiledSource, "async");
		});

		it("should handle multiple async operations", async () => {
			const template = new BaseTemplate(
				'%{<script>const a = await Promise.resolve(1); const b = await Promise.resolve(2); document.write(a + b)</script>}%',
			);
			const compiler = new PageCompiler();

			await compiler.execute({ template });

			assert.strictEqual(template.compiledSource, "3");
		});
	});
});

