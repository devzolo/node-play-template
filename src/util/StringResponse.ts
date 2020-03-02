import stream from 'stream';

export class StringResponse extends stream.Writable {
  private _data = '';

  _write(chunk, encoding, done): void {
    this._data += chunk.toString();
    done();
  }

  get data(): string {
    return this._data;
  }

  set data(data: string) {
    this._data = data;
  }
}
