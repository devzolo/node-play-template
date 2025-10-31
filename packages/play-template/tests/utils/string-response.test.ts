import assert from "node:assert";
import { describe, it } from "node:test";
import { StringResponse } from "../../src/util/string-response.ts";

describe("StringResponse", () => {
	describe("Basic Functionality", () => {
		it("should accumulate string chunks", (t, done) => {
			const response = new StringResponse();

			response.write("Hello ");
			response.write("World");
			response.end();

			response.on("finish", () => {
				assert.strictEqual(response.data, "Hello World");
				done();
			});
		});

		it("should handle buffer chunks", (t, done) => {
			const response = new StringResponse();

			response.write(Buffer.from("Test"));
			response.end();

			response.on("finish", () => {
				assert.strictEqual(response.data, "Test");
				done();
			});
		});

		it("should handle Uint8Array chunks", (t, done) => {
			const response = new StringResponse();
			const data = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"

			response.write(data);
			response.end();

			response.on("finish", () => {
				assert.strictEqual(response.data, "Hello");
				done();
			});
		});
	});

	describe("Data Access", () => {
		it("should get accumulated data", () => {
			const response = new StringResponse();

			response.write("Data");
			assert.strictEqual(response.data, "Data");
		});

		it("should set data directly", () => {
			const response = new StringResponse();

			response.data = "Direct";
			assert.strictEqual(response.data, "Direct");
		});

		it("should handle empty data", () => {
			const response = new StringResponse();

			assert.strictEqual(response.data, "");
		});
	});

	describe("Multiple Writes", () => {
		it("should handle many small writes", (t, done) => {
			const response = new StringResponse();
			const chunks = ["a", "b", "c", "d", "e"];

			for (const chunk of chunks) {
				response.write(chunk);
			}
			response.end();

			response.on("finish", () => {
				assert.strictEqual(response.data, "abcde");
				done();
			});
		});

		it("should handle mixed string and buffer writes", (t, done) => {
			const response = new StringResponse();

			response.write("String");
			response.write(Buffer.from(" and "));
			response.write("Buffer");
			response.end();

			response.on("finish", () => {
				assert.strictEqual(response.data, "String and Buffer");
				done();
			});
		});
	});

	describe("Encoding", () => {
		it("should respect encoding in buffer conversion", (t, done) => {
			const response = new StringResponse();
			const buffer = Buffer.from("Action", "utf8");

			response.write(buffer, "utf8");
			response.end();

			response.on("finish", () => {
				assert.strictEqual(response.data, "Action");
				done();
			});
		});
	});
});

