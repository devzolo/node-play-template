import stream from 'node:stream';

export class StringResponse extends stream.Writable {
  #data = '';

  _write(chunk: any, encoding: any, done: (error?: Error | null) => void): void {
    if (chunk === null || chunk === undefined) {
      this.#data += String(chunk);
    } else if (typeof chunk === 'string') {
      this.#data += chunk;
    } else if (Buffer.isBuffer(chunk)) {
      // Handle the case where encoding might be 'buffer' which is not valid for toString()
      const validEncoding = encoding === 'buffer' || !encoding ? 'utf8' : encoding;
      this.#data += chunk.toString(validEncoding);
    } else {
      this.#data += String(chunk);
    }
    done();
  }

  get data(): string {
    return this.#data;
  }

  set data(data: string) {
    this.#data = data;
  }
}
