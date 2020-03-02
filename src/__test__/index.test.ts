import { BaseTemplate, PageCompiler } from '../template';
import { StringResponse } from '../util';
import stream from 'stream';

describe('Template Test', () => {
  it('asas', async () => {
    const template: BaseTemplate = new BaseTemplate('testando template %{document.write("teste")}%');
    template.name = 'teste';
    const compiler: PageCompiler = new PageCompiler({});

    try {
      const res = new StringResponse();
      await compiler.execute(template, new stream.Readable(), res, (err?: any) => void {});
      console.log(res.data);
    } catch (e) {
      console.error('Error: ', e);
    }
  });
});
