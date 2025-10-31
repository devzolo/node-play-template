import { createRequire } from "node:module";
import type stream from "node:stream";
import vm from "node:vm";
import KitaHtml from "@kitajs/html";
import { typescriptTranspile } from "../util/typescript.ts";
import type { BaseTemplate } from "./base-template.ts";
import { TemplateCompiler } from "./template-compiler.ts";
import { TemplateParser } from "./template-parser.ts";
import { Token } from "./token.ts";

const require = createRequire(import.meta.url);

// JSX factory function for @kitajs/html
function Html(
	tag: string | ((props: Record<string, unknown>) => string),
	props: Record<string, unknown> | null,
	...children: unknown[]
): string {
	// If tag is a function component
	if (typeof tag === "function") {
		return tag({ ...props, children });
	}

	// Build the HTML element
	const attributes = props
		? Object.entries(props)
				.map(([key, value]) => {
					if (value === true) return key;
					if (value === false || value === null || value === undefined)
						return "";
					return `${key}="${String(value).replace(/"/g, "&quot;")}"`;
				})
				.filter((attr) => attr !== "")
				.join(" ")
		: "";

	const openTag = attributes ? `<${tag} ${attributes}>` : `<${tag}>`;
	const content = children.flat(Number.POSITIVE_INFINITY).join("");
	const closeTag = `</${tag}>`;

	return `${openTag}${content}${closeTag}`;
}

interface Tag {
	scriptSource: string;
}

export class PageCompiler extends TemplateCompiler {
	req?: stream.Readable;

	res?: stream.Writable;

	next: (err?: Error) => void = () => {
		//
	};

	tag?: Tag;

	level = 0;

	currentLine = 0;

	exited = false;

	compiledSource = "";

	skipLineBreak = false;

	state: Token | undefined;

	parser: TemplateParser | undefined;

	template: BaseTemplate | undefined | null;

	exiting = false;

	doNextScan = true;

	scope: Record<string, unknown>;

	constructor(scope?: Record<string, unknown>) {
		super();
		this.scope = scope || {};
	}

	public tagPrint(text: string): void {
		if (!this.exiting && this.tag) {
			this.tag.scriptSource += text;
		}
	}

	source(): string {
		return this.template?.getSource() || "";
	}

	head(): void {
		//
	}

	end(): void {
		this.res?.write(this.compiledSource);
		this.res?.end();
	}

	plain(): void {
		// System.out.println("plain");

		if (this.level === 0) this.print(this.parser?.getToken() || "");
		else {
			this.tagPrint(this.parser?.getToken() || "");
		}
	}

	script(): Promise<string> {
		return new Promise((resolve, reject) => {
			try {
				// Context ctx = Context.enter();
				// String expr = parser.getToken().trim();
				// ctx.evaluateString(scope, expr, "expr", ++line, null);
				/// /print(retval.toString());
				// Context.exit();
				let expr: string = this.parser?.getToken().trim() || "";
				// eval(expr);

				const sandbox: Record<string, unknown> = {
					document: {
						write: (text: string) => {
							this.print(String(text));
						},
					},
					request: this.req,
					response: this.res,
					console,
					require,
					process,
					Html,
					KitaHtml,
				};

				for (const key in this.scope) {
					if (Object.hasOwn(this.scope, key)) {
						sandbox[key] = this.scope[key];
					}
				}

				// vm.createContext(sandbox);

				/*
                (<any>global).document = {
                    write: (text) => {
                        this.print(text);
                    },
                    //end: resolve
                };
                (<any>global).req = this.req;
                (<any>global).res = this.req;
*/
				if (expr.startsWith("<script>")) {
					expr = expr.substring(8);
				}
				if (expr.endsWith("</script>")) {
					expr = expr.substring(0, expr.length - 9);
				}

				const content = `(async () => { ${expr} })()`;

				const transpilation = typescriptTranspile(
					content,
					this.template?.name || "",
				);

				const script = new vm.Script(transpilation.outputText);

				script
					.runInNewContext(sandbox, {
						filename: this.template?.name || "",
						displayErrors: true,
					})
					.then(resolve)
					.catch(reject);

				// script.runInThisContext().then(resolve).catch(reject);
			} catch (e) {
				console.error(e);
				reject(e);
			}
		});
	}

	expr(): void {
		throw new Error("expr Method not implemented.");
	}

	message(): void {
		throw new Error("message Method not implemented.");
	}

	action(_absolute: boolean): void {
		throw new Error("action Method not implemented.");
	}

	startTag(): void {
		throw new Error("startTag Method not implemented.");
	}

	endTag(): void {
		throw new Error("endTag Method not implemented.");
	}

	async execute(opts: {
		template: BaseTemplate;
		req?: stream.Readable;
		res?: stream.Writable;
		next?: (err?: Error) => void;
	}): Promise<string> {
		this.req = opts.req;
		this.res = opts.res;
		this.next =
			opts.next ||
			((): void => {
				//
			});
		this.template = opts.template;
		const source = this.source();
		this.parser = new TemplateParser(source);

		// Class header
		this.head();

		// Parse
		loop: for (; !this.exiting; ) {
			if (this.doNextScan) {
				this.state = this.parser.nextToken();
			} else {
				this.doNextScan = true;
			}

			switch (this.state) {
				case Token.EOF:
					break loop;
				case Token.PLAIN:
					this.plain();
					break;
				case Token.SCRIPT:
					try {
						await this.script();
					} catch (e) {
						console.error(e);
						this.next(e instanceof Error ? e : new Error(String(e)));
					}
					break;
				case Token.EXPR:
					this.expr();
					break;
				case Token.MESSAGE:
					this.message();
					break;
				case Token.ACTION:
					this.action(false);
					break;
				case Token.ABS_ACTION:
					this.action(true);
					break;
				case Token.COMMENT:
					this.skipLineBreak = true;
					break;
				case Token.START_TAG:
					this.startTag();
					break;
				case Token.END_TAG:
					this.endTag();
					break;
				default:
					break;
			}
		}

		// Class end
		this.end();

		// Done !
		opts.template.compiledSource = this.compiledSource;

		return this.compiledSource;
	}

	private checkExit(): void {
		if (this.exiting) {
			this.exited = true;
		}
	}

	public markLine(line: number): void {
		if (!this.exited) {
			this.compiledSource += "// line ";
			this.compiledSource += line;
			if (this.template?.linesMatrix)
				this.template.linesMatrix[this.currentLine] = line;
		}
		this.checkExit();
	}

	public print(text: string): void {
		if (!this.exited) {
			this.compiledSource += text;
		}
		this.checkExit();
	}

	public printForced(text: string): void {
		this.compiledSource += text;
		this.checkExit();
	}

	public println(text?: string): void {
		if (!this.exited) {
			if (text) this.compiledSource += text;
			this.compiledSource += "\n";
			this.currentLine++;
		}
		this.checkExit();
	}

	public write(text: string): void {
		this.print(text);
	}

	public writeln(text?: string): void {
		this.println(text);
	}

	public clear(): void {
		if (!this.exited) {
			this.compiledSource = "";
		}
		this.checkExit();
	}
}
