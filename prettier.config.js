/** @type {import('prettier').Config} */
export default {
  // Basic formatting
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',

  // Indentation
  tabWidth: 2,
  useTabs: false,

  // Line length
  printWidth: 100,

  // Spacing
  bracketSpacing: true,
  bracketSameLine: false,

  // Arrow functions
  arrowParens: 'avoid',

  // End of line
  endOfLine: 'lf',

  // Embedded languages
  embeddedLanguageFormatting: 'auto',

  // HTML whitespace sensitivity
  htmlWhitespaceSensitivity: 'css',

  // Prose wrapping
  proseWrap: 'preserve',

  // File-specific overrides
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
      },
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
      },
    },
  ],
};
