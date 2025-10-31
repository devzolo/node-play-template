export class Template {
	public name = "";

	public source = "";

	public setSource(source: string): void {
		this.source = source;
	}

	public getSource(): string {
		return this.source;
	}

	public finalize(): void {
		if (this.source != null) this.source = "";
	}
}
