import { Template } from "./template.ts";

export class BaseTemplate extends Template {
	public path: string;

	public compiledSource = "";

	public linesMatrix: number[] = [];

	public compiledTemplate = "";

	public compiledTemplateName = "";

	public timestamp: number = Date.now();

	public constructor(path: string, name?: string, source = "") {
		super();
		this.path = path;
		this.name = name || crypto.randomUUID();
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
