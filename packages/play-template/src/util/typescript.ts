import { createRequire } from "node:module";
import path from "node:path";
import ts from "typescript";

const require = createRequire(import.meta.url);

export function typescriptTranspile(scriptSource: string, scriptName: string) {
	const sourcePathToSource = Object.create(null);

	// Try to install source-map-support if available (optional peer dependency)
	try {
		require("source-map-support").install({
			environment: "node",
			// Pass to source-map-support a custom function for retrieving sources
			// from source paths. This runs after source-map-support's default logic,
			// only if that logic fails to find the requested source.
			retrieveFile: (sourcePath: string) => sourcePathToSource[sourcePath],
		});
	} catch {
		// source-map-support is optional, continue without it
	}

	const compilerOptions: ts.CompilerOptions = {
		module: ts.ModuleKind.CommonJS,
		jsx: ts.JsxEmit.React,
		jsxFactory: "Html",
		sourceMap: true,
		moduleResolution: ts.ModuleResolutionKind.Classic,
		allowJs: true,
		inlineSources: true,
		target: ts.ScriptTarget.ES2019,
		strict: false,
		lib: ["es2015", "es5", "es6", "dom"],
	};

	// The path that the ts module would have.
	const tsPath = path.resolve(`${scriptName}.tsx`);

	const res1 = ts.transpileModule(scriptSource, {
		compilerOptions,
		fileName: tsPath,
		moduleName: scriptName,
	});

	// The path that the compiled module would have.
	const jsPath = path.resolve(`${scriptName}.js`);

	// Establish the relationship between the path and the source.
	sourcePathToSource[jsPath] = res1.outputText;
	// Ditto for the source map file.
	sourcePathToSource[path.resolve(`${scriptName}.js.map`)] = res1.sourceMapText;
	return res1;
}
