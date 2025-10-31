import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { BaseTemplate, PageCompiler } from "../../src/template/index.ts";
import { StringResponse } from "../../src/util/string-response.ts";

describe("Integration Tests", () => {
	describe("Complete Template Rendering", () => {
		it("should render mixed static and dynamic content", async () => {
			const source = fs.readFileSync(
				path.join(import.meta.dirname, "../fixtures/mixed-content.xhtml"),
				{ encoding: "utf8" },
			);

			const template = new BaseTemplate(source.trim());
			const compiler = new PageCompiler();

			await compiler.execute({ template });

			assert.ok(template.compiledSource.includes("<h1>Static Content</h1>"));
			assert.ok(template.compiledSource.includes("<p>Hello, World!</p>"));
			assert.ok(template.compiledSource.includes("<footer>End of page</footer>"));
		});

		it("should work with stream response", async () => {
			const template = new BaseTemplate(
				'%{<script>document.write("Stream test")</script>}%',
			);
			const response = new StringResponse();
			const compiler = new PageCompiler();

			await compiler.execute({ template, res: response });

			assert.strictEqual(template.compiledSource, "Stream test");
		});

		it("should handle complex real-world scenario", async () => {
			const template = new BaseTemplate(`
<!DOCTYPE html>
<html>
<head>
  <title>User Profile</title>
</head>
<body>
  %{<script>
    const user = {
      name: userName,
      age: userAge,
      role: userRole
    };

    function renderUser(u) {
      return (
        <div class="profile">
          <h1>{u.name}</h1>
          <p>Age: {u.age}</p>
          <p>Role: {u.role}</p>
        </div>
      );
    }

    document.write(renderUser(user));
  </script>}%
</body>
</html>
			`);

			const compiler = new PageCompiler({
				userName: "John Doe",
				userAge: 30,
				userRole: "Developer",
			});

			await compiler.execute({ template });

			assert.ok(template.compiledSource.includes("<h1>John Doe</h1>"));
			assert.ok(template.compiledSource.includes("Age: 30"));
			assert.ok(template.compiledSource.includes("Role: Developer"));
			assert.ok(template.compiledSource.includes('class="profile"'));
		});
	});

	describe("Error Recovery", () => {
		it("should continue after error with error handler", async () => {
			const template = new BaseTemplate(
				'Before %{<script>throw new Error("oops")</script>}% After',
			);
			const compiler = new PageCompiler();

			let errorReceived: Error | undefined;
			const next = (err?: Error) => {
				errorReceived = err;
			};

			await compiler.execute({ template, next });

			assert.ok(errorReceived, "Should receive an error");
			assert.ok(
				errorReceived?.message.includes("oops"),
				"Error message should include 'oops'",
			);
		});
	});

	describe("Performance Scenarios", () => {
		it("should handle large templates efficiently", async () => {
			const largeContent = "x".repeat(10000);
			const template = new BaseTemplate(
				`Start ${largeContent} %{<script>document.write("middle")</script>}% End`,
			);
			const compiler = new PageCompiler();

			const start = Date.now();
			await compiler.execute({ template });
			const duration = Date.now() - start;

			assert.ok(template.compiledSource.includes("middle"));
			assert.ok(duration < 1000, "Should complete within 1 second");
		});

		it("should handle many small scripts", async () => {
			const scripts = Array(100)
				.fill(0)
				.map((_, i) => `%{<script>document.write("${i}")</script>}%`)
				.join("");

			const template = new BaseTemplate(scripts);
			const compiler = new PageCompiler();

			await compiler.execute({ template });

			// Check that we have all numbers from 0 to 99
			for (let i = 0; i < 100; i++) {
				assert.ok(template.compiledSource.includes(String(i)));
			}
		});
	});
});

