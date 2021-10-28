import stream from 'stream';

export class StringResponse extends stream.Writable {
  #data = '';

  _write(chunk: any, encoding: BufferEncoding, done: (error?: Error | null) => void): void {
    this.#data += chunk.toString(encoding);
    done();
  }

  get data(): string {
    return this.#data;
  }

  set data(data: string) {
    this.#data = data;
  }
}
