import ts from 'typescript';
import path from 'node:path';
import { createRequire } from 'node:module';

const _require = createRequire(import.meta.url);

export function typescriptTranspile(scriptSource: string, scriptName: string) {
  const sourcePathToSource = Object.create(null);

  // Note: Modern Node.js has built-in source map support via --enable-source-maps flag
  // No need for external source-map-support package

  const compilerOptions: ts.CompilerOptions = {
    module: ts.ModuleKind.None,
    jsx: ts.JsxEmit.ReactJSX,
    jsxImportSource: '@kitajs/html',
    sourceMap: true,
    moduleResolution: ts.ModuleResolutionKind.Classic,
    allowJs: true,
    inlineSources: true,
    target: ts.ScriptTarget.ES2019,
    strict: false,
    lib: ['es2015', 'es5', 'es6', 'dom'],
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
