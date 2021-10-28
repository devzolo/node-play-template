export class TemplateCompilerError extends Error {
  constructor(e: Error) {
    super();
    this.message = e.message;
  }
}
