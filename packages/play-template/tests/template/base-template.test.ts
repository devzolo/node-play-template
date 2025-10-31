import assert from "node:assert";
import { describe, it } from "node:test";
import { BaseTemplate } from "../../src/template/index.ts";

describe("BaseTemplate", () => {
	it("should create a template with source", () => {
		const source = "Hello World";
		const template = new BaseTemplate(source);

		assert.strictEqual(template.getSource(), source);
	});

	it("should have an empty compiled source initially", () => {
		const template = new BaseTemplate("test");

		assert.strictEqual(template.compiledSource, "");
	});

	it("should accept a template name", () => {
		const template = new BaseTemplate("test", "test-template");

		assert.strictEqual(template.name, "test-template");
	});

	it("should handle empty source", () => {
		const template = new BaseTemplate("");

		assert.strictEqual(template.getSource(), "");
	});

	it("should handle multiline source", () => {
		const source = `line 1
line 2
line 3`;
		const template = new BaseTemplate(source);

		assert.strictEqual(template.getSource(), source);
	});
});

