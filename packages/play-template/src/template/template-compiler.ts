export abstract class TemplateCompiler {
	abstract source(): string;

	abstract head(): void;

	abstract end(): void;

	//
	abstract plain(): void;

	// %{...}% or {%...%}
	abstract script(): void;

	// ${...}
	abstract expr(): void;

	// &{...}
	abstract message(): void;

	// @{...}
	// absolute=> @@{...}
	abstract action(absolute: boolean): void;

	// #{...}
	abstract startTag(): void;

	// #{/...}
	abstract endTag(): void;

	// comment *{...}*
}
