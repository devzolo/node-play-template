import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { BaseTemplate, PageCompiler } from '../template';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// import { StringResponse } from '../util';
// import stream from 'stream';

describe('Template Test', () => {
  it('Check if %{document.write("test")}% = "teste"', async () => {
    const template: BaseTemplate = new BaseTemplate('test = %{<script>document.write("test")</script>}%');
    const compiler: PageCompiler = new PageCompiler();
    await compiler.execute({ template });
    expect(template.compiledSource).toBe('test = test');
  });

  it('Check test.xhtml = {"hello":"world"}', async () => {
    const source = fs.readFileSync(path.join(__dirname, 'test.xhtml'), { encoding: 'utf8' });
    const template: BaseTemplate = new BaseTemplate(source.trim());
    const compiler: PageCompiler = new PageCompiler();
    await compiler.execute({ template });
    expect(template.compiledSource).toBe('{"hello":"world"}');
  });

  it('Kita HTML Test', async () => {
    const source = fs.readFileSync(path.join(__dirname, 'kita.xhtml'), { encoding: 'utf8' });
    const template: BaseTemplate = new BaseTemplate(source.trim());
    const compiler: PageCompiler = new PageCompiler();
    await compiler.execute({ template });
    console.log(template.compiledSource);
    expect(template.compiledSource).toContain('<div>TESTE</div>');
  });
});
