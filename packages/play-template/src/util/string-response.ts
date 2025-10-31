import stream from "node:stream";

export class StringResponse extends stream.Writable {
	#data = "";

	_write(
		chunk: string | Buffer | Uint8Array,
		encoding: BufferEncoding,
		done: (error?: Error | null) => void,
	): void {
		if (typeof chunk === "string") {
			this.#data += chunk;
		} else if (chunk instanceof Buffer) {
			// Use utf8 as fallback if encoding is 'buffer' (non-standard but can happen)
			const enc =
				encoding === ("buffer" as BufferEncoding) ? "utf8" : encoding;
			this.#data += chunk.toString(enc);
		} else {
			// Use utf8 as fallback if encoding is 'buffer' (non-standard but can happen)
			const enc =
				encoding === ("buffer" as BufferEncoding) ? "utf8" : encoding;
			this.#data += Buffer.from(chunk).toString(enc);
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
