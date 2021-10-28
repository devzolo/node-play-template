import { v1 as uuidv1 } from 'uuid';
import { Template } from './Template';

export class BaseTemplate extends Template {
  public path: string;

  public compiledSource = '';

  public linesMatrix: number[] = [];

  public compiledTemplate = '';

  public compiledTemplateName = '';

  public timestamp: number = new Date().getTime();

  public constructor(path: string, name?: string, source = '') {
    super();
    this.path = path;
    this.name = name || uuidv1();
    if (!name && !source) {
      source = path;
    }
    this.setSource(source);
  }

  public getCompiledSource(): string {
    return this.compiledSource;
  }

  public getCompiledBytes(/* charset: string */): string {
    return this.compiledSource;
  }
}
