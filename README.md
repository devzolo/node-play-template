Node Play Template ia a efficient templating system which allows to dynamically generate HTML, XML, JSON or any text-based formatted document. The template engine uses Typescript as an expression language. 


```ts
  import { BaseTemplate, PageCompiler } from 'node-play-template';

  const template = new BaseTemplate('test = %{ document.write("test") }%');

  const compiler = new PageCompiler();

  await compiler.execute({ template });

  const text = template.compiledSource;

  console.log(text); // it prints: test = test
```