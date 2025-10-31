export enum Token {
	EOF, //
	PLAIN, //
	SCRIPT, // %{...}% or {%...%}
	EXPR, // ${...}
	START_TAG, // #{...}
	END_TAG, // #{/...}
	MESSAGE, // &{...}
	ACTION, // @{...}
	ABS_ACTION, // @@{...}
	COMMENT, // *{...}*
	// HTML_COMMENT_START_SCRIPT, // <!--#{}-->
	// HTML_COMMENT_END_SCRIPT, // <!--#{/}-->
}
