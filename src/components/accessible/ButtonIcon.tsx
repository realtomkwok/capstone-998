import React, { useRef, useEffect } from 'react';

interface AccessibleButtonIconProps {
	ariaLabel: string;
    ariaDescription?: string;
    [key: string]: any;
}

const AccessibleButtonIcon: React.FC<AccessibleButtonIconProps> = ({
	ariaLabel,
    ariaDescription,
    ...props
}) => {
	const buttonRef = useRef<HTMLElement>(null);

	useEffect(() => {
		if (buttonRef.current) {
			const button = buttonRef.current.shadowRoot?.querySelector('button');
			if (button) {
				button.setAttribute('aria-label', ariaLabel);
				if (ariaDescription) {
					button.setAttribute('aria-description', ariaDescription);
				}
			}
		}
	}, [ariaLabel, ariaDescription]);

	return (
		<>
			<mdui-button-icon
                ref={buttonRef}
                {...props}
			></mdui-button-icon>
			<span className="sr-only">{ariaLabel}</span>
			{ariaDescription && <span className="sr-only">{ariaDescription}</span>}
		</>
	);
};

export default AccessibleButtonIcon;