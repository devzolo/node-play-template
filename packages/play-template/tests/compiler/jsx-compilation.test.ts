import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { BaseTemplate, PageCompiler } from "../../src/template/index.ts";

describe("JSX Compilation", () => {
	describe("Basic JSX", () => {
		it("should compile simple JSX component", async () => {
			const source = fs.readFileSync(
				path.join(import.meta.dirname, "../fixtures/jsx-component.xhtml"),
				{ encoding: "utf8" },
			);

			const template = new BaseTemplate(source.trim());
			const compiler = new PageCompiler();

			await compiler.execute({ template });

			assert.strictEqual(template.compiledSource, "<div>TESTE</div>");
		});

		it("should compile JSX with attributes", async () => {
			const template = new BaseTemplate(
				'%{<script>document.write(<div class="test" id="main">Content</div>)</script>}%',
			);
			const compiler = new PageCompiler();

			await compiler.execute({ template });

			assert.strictEqual(
				template.compiledSource,
				'<div class="test" id="main">Content</div>',
			);
		});

		it("should compile self-closing JSX tags", async () => {
			const template = new BaseTemplate(
				'%{<script>document.write(<input type="text" />)</script>}%',
			);
			const compiler = new PageCompiler();

			await compiler.execute({ template });

			assert.ok(template.compiledSource.includes("input"));
			assert.ok(template.compiledSource.includes('type="text"'));
		});
	});

	describe("Component Functions", () => {
		it("should handle functional components", async () => {
			const template = new BaseTemplate(
				'%{<script>function Button() { return <button>Click</button>; } document.write(Button())</script>}%',
			);
			const compiler = new PageCompiler();

			await compiler.execute({ template });

			assert.strictEqual(template.compiledSource, "<button>Click</button>");
		});

		it("should handle components with props", async () => {
			const source = fs.readFileSync(
				path.join(import.meta.dirname, "../fixtures/nested-jsx.xhtml"),
				{ encoding: "utf8" },
			);

			const template = new BaseTemplate(source.trim());
			const compiler = new PageCompiler();

			await compiler.execute({ template });

			assert.ok(template.compiledSource.includes('class="card"'));
			assert.ok(template.compiledSource.includes("<h2>Hello</h2>"));
			assert.ok(template.compiledSource.includes('class="content"'));
			assert.ok(template.compiledSource.includes("World"));
		});

		it("should handle arrow function components", async () => {
			const template = new BaseTemplate(
				'%{<script>const Greeting = () => <span>Hi</span>; document.write(Greeting())</script>}%',
			);
			const compiler = new PageCompiler();

			await compiler.execute({ template });

			assert.strictEqual(template.compiledSource, "<span>Hi</span>");
		});
	});

	describe("Nested JSX", () => {
		it("should handle nested elements", async () => {
			const template = new BaseTemplate(
				'%{<script>document.write(<div><p><span>Nested</span></p></div>)</script>}%',
			);
			const compiler = new PageCompiler();

			await compiler.execute({ template });

			assert.strictEqual(
				template.compiledSource,
				"<div><p><span>Nested</span></p></div>",
			);
		});

		it("should handle multiple children", async () => {
			const template = new BaseTemplate(
				'%{<script>document.write(<ul><li>A</li><li>B</li><li>C</li></ul>)</script>}%',
			);
			const compiler = new PageCompiler();

			await compiler.execute({ template });

			assert.strictEqual(
				template.compiledSource,
				"<ul><li>A</li><li>B</li><li>C</li></ul>",
			);
		});
	});

	describe("Dynamic JSX", () => {
		it("should handle dynamic attributes", async () => {
			const template = new BaseTemplate(
				'%{<script>const cls = "dynamic"; document.write(<div class={cls}>Test</div>)</script>}%',
			);
			const compiler = new PageCompiler();

			await compiler.execute({ template });

			assert.ok(template.compiledSource.includes('class="dynamic"'));
		});

		it("should handle dynamic children", async () => {
			const template = new BaseTemplate(
				'%{<script>const items = ["A", "B", "C"]; const html = items.map(i => `<li>${i}</li>`).join(""); document.write(`<ul>${html}</ul>`)</script>}%',
			);
			const compiler = new PageCompiler();

			await compiler.execute({ template });

			assert.ok(template.compiledSource.includes("<li>A</li>"));
			assert.ok(template.compiledSource.includes("<li>B</li>"));
			assert.ok(template.compiledSource.includes("<li>C</li>"));
		});

		it("should handle conditional rendering", async () => {
			const template = new BaseTemplate(
				'%{<script>const show = true; document.write(show ? <div>Shown</div> : <div>Hidden</div>)</script>}%',
			);
			const compiler = new PageCompiler();

			await compiler.execute({ template });

			assert.strictEqual(template.compiledSource, "<div>Shown</div>");
		});
	});
});

