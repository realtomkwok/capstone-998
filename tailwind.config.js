/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{ts,tsx,html}'],
	theme: {
		fontFamily: {
			sans: ['Public Sans', 'Circular', 'system-ui', 'sans-serif'],
			mono: ['Public Sans', 'Circular Mono', 'monospace'],
		},
		extend: {
			fontSize: {
				'display-large': 'var(--mdui-typescale-display-large-size)',
				'display-medium': 'var(--mdui-typescale-display-medium-size)',
				'display-small': 'var(--mdui-typescale-display-small-size)',
				'headline-large': 'var(--mdui-typescale-headline-large-size)',
				'headline-medium': 'var(--mdui-typescale-headline-medium-size)',
				'headline-small': 'var(--mdui-typescale-headline-small-size)',
				'title-large': 'var(--mdui-typescale-title-large-size)',
				'title-medium': 'var(--mdui-typescale-title-medium-size)',
				'title-small': 'var(--mdui-typescale-title-small-size)',
				'label-large': 'var(--mdui-typescale-label-large-size)',
				'label-medium': 'var(--mdui-typescale-label-medium-size)',
				'label-small': 'var(--mdui-typescale-label-small-size)',
				'body-large': 'var(--mdui-typescale-body-large-size)',
				'body-medium': 'var(--mdui-typescale-body-medium-size)',
				'body-small': 'var(--mdui-typescale-body-small-size)',
			},
			fontWeight: {
				'display-large': 'var(--mdui-typescale-display-large-weight)',
				'display-medium': 'var(--mdui-typescale-display-medium-weight)',
				'display-small': 'var(--mdui-typescale-display-small-weight)',
				'headline-large': 'var(--mdui-typescale-headline-large-weight)',
				'headline-medium':
					'var(--mdui-typescale-headline-medium-weight)',
				'headline-small': 'var(--mdui-typescale-headline-small-weight)',
				'title-large': 'var(--mdui-typescale-title-large-weight)',
				'title-medium': 'var(--mdui-typescale-title-medium-weight)',
				'title-small': 'var(--mdui-typescale-title-small-weight)',
				'label-large': 'var(--mdui-typescale-label-large-weight)',
				'label-medium': 'var(--mdui-typescale-label-medium-weight)',
				'label-small': 'var(--mdui-typescale-label-small-weight)',
				'body-large': 'var(--mdui-typescale-body-large-weight)',
				'body-medium': 'var(--mdui-typescale-body-medium-weight)',
				'body-small': 'var(--mdui-typescale-body-small-weight)',
			},
			letterSpacing: {
				'display-large': 'var(--mdui-typescale-display-large-tracking)',
				'display-medium':
					'var(--mdui-typescale-display-medium-tracking)',
				'display-small': 'var(--mdui-typescale-display-small-tracking)',
				'headline-large':
					'var(--mdui-typescale-headline-large-tracking)',
				'headline-medium':
					'var(--mdui-typescale-headline-medium-tracking)',
				'headline-small':
					'var(--mdui-typescale-headline-small-tracking)',
				'title-large': 'var(--mdui-typescale-title-large-tracking)',
				'title-medium': 'var(--mdui-typescale-title-medium-tracking)',
				'title-small': 'var(--mdui-typescale-title-small-tracking)',
				'label-large': 'var(--mdui-typescale-label-large-tracking)',
				'label-medium': 'var(--mdui-typescale-label-medium-tracking)',
				'label-small': 'var(--mdui-typescale-label-small-tracking)',
				'body-large': 'var(--mdui-typescale-body-large-tracking)',
				'body-medium': 'var(--mdui-typescale-body-medium-tracking)',
				'body-small': 'var(--mdui-typescale-body-small-tracking)',
			},
			lineHeight: {
				'display-large':
					'var(--mdui-typescale-display-large-line-height)',
				'display-medium':
					'var(--mdui-typescale-display-medium-line-height)',
				'display-small':
					'var(--mdui-typescale-display-small-line-height)',
				'headline-large':
					'var(--mdui-typescale-headline-large-line-height)',
				'headline-medium':
					'var(--mdui-typescale-headline-medium-line-height)',
				'headline-small':
					'var(--mdui-typescale-headline-small-line-height)',
				'title-large': 'var(--mdui-typescale-title-large-line-height)',
				'title-medium':
					'var(--mdui-typescale-title-medium-line-height)',
				'title-small': 'var(--mdui-typescale-title-small-line-height)',
				'label-large': 'var(--mdui-typescale-label-large-line-height)',
				'label-medium':
					'var(--mdui-typescale-label-medium-line-height)',
				'label-small': 'var(--mdui-typescale-label-small-line-height)',
				'body-large': 'var(--mdui-typescale-body-large-line-height)',
				'body-medium': 'var(--mdui-typescale-body-medium-line-height)',
				'body-small': 'var(--mdui-typescale-body-small-line-height)',
			},
			colors: {
				primary: 'rgb(var(--mdui-color-primary))',
				'primary-container': 'rgb(var(--mdui-color-primary-container))',
				'on-primary': 'rgb(var(--mdui-color-on-primary))',
				'on-primary-container':
					'rgb(var(--mdui-color-on-primary-container))',
				'inverse-primary': 'rgb(var(--mdui-color-inverse-primary))',
				secondary: 'rgb(var(--mdui-color-secondary))',
				'secondary-container':
					'rgb(var(--mdui-color-secondary-container))',
				'on-secondary': 'rgb(var(--mdui-color-on-secondary))',
				'on-secondary-container':
					'rgb(var(--mdui-color-on-secondary-container))',
				tertiary: 'rgb(var(--mdui-color-tertiary))',
				'tertiary-container':
					'rgb(var(--mdui-color-tertiary-container))',
				'on-tertiary': 'rgb(var(--mdui-color-on-tertiary))',
				'on-tertiary-container':
					'rgb(var(--mdui-color-on-tertiary-container))',
				surface: 'rgb(var(--mdui-color-surface))',
				'surface-dim': 'rgb(var(--mdui-color-surface-dim))',
				'surface-bright': 'rgb(var(--mdui-color-surface-bright))',
				'surface-container-lowest':
					'rgb(var(--mdui-color-surface-container-lowest))',
				'surface-container-low':
					'rgb(var(--mdui-color-surface-container-low))',
				'surface-container': 'rgb(var(--mdui-color-surface-container))',
				'surface-container-high':
					'rgb(var(--mdui-color-surface-container-high))',
				'surface-container-highest':
					'rgb(var(--mdui-color-surface-container-highest))',
				'surface-variant': 'rgb(var(--mdui-color-surface-variant))',
				'on-surface': 'rgb(var(--mdui-color-on-surface))',
				'on-surface-variant':
					'rgb(var(--mdui-color-on-surface-variant))',
				'inverse-surface': 'rgb(var(--mdui-color-inverse-surface))',
				'inverse-on-surface':
					'rgb(var(--mdui-color-inverse-on-surface))',
				background: 'rgb(var(--mdui-color-background))',
				'on-background': 'rgb(var(--mdui-color-on-background))',
				error: 'rgb(var(--mdui-color-error))',
				'error-container': 'rgb(var(--mdui-color-error-container))',
				'on-error': 'rgb(var(--mdui-color-on-error))',
				'on-error-container':
					'rgb(var(--mdui-color-on-error-container))',
				outline: 'rgb(var(--mdui-color-outline))',
				'outline-variant': 'rgb(var(--mdui-color-outline-variant))',
				shadow: 'rgb(var(--mdui-color-shadow))',
				'surface-tint': 'rgb(var(--mdui-color-surface-tint))',
				scrim: 'rgb(var(--mdui-color-scrim))',
			},
		},
	},
	plugins: [],
};

