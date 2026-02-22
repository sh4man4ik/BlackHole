import js from '@eslint/js';
import globals from 'globals';

export default [
	js.configs.recommended,
	{
		files: ['**/*.js', '**/*.jsx'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node,
				ObjectId: 'readonly',
				JSX: 'readonly'
			},

			parserOptions: {
				ecmaFeatures: {
					jsx: true
				}
			}
		},

		rules: {
			semi: ['error', 'always'],
			'no-unused-vars': 'off',
			'no-undef': 'warn',
			'prefer-const': 'off'
		}
	}
];
