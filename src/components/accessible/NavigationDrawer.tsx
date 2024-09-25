import { NavigationDrawer } from 'mdui';
import React, { HTMLAttributes, useEffect, useRef } from 'react';

interface AccessibleNavigationDrawerProps {
	navigationDrawerRef: React.RefObject<NavigationDrawer>;
	children: React.ReactNode;
	isOpen: boolean;
	accessibility: {
		role: string;
		ariaLabel: string;
		ariaLabelledBy: string;
		ariaDescription: string;
	};
	[key: string]: any;
}
const AccessibleNavigationDrawer: React.FC<AccessibleNavigationDrawerProps> = ({
	navigationDrawerRef,
	isOpen,
	children,
	accessibility,
	...props
}) => {
	const componentRef = useRef<NavigationDrawer>(null);
	const navigationDrawer = document.querySelector('mdui-navigation-drawer');

	useEffect(() => {
		if (componentRef.current) {
			componentRef.current.open = isOpen;
		}
	}, [isOpen]);

	useEffect(() => {
		const navigationDrawerSlot =
			navigationDrawer?.shadowRoot?.querySelector('slot');

		if (navigationDrawerSlot) {
			navigationDrawerSlot.setAttribute(
				'role',
				accessibility.role
			);
			navigationDrawerSlot.setAttribute(
				'aria-label',
				accessibility.ariaLabel
			);
			navigationDrawerSlot.setAttribute('aria-modal', 'true');
			navigationDrawerSlot.setAttribute(
				'aria-labelledby',
				accessibility.ariaLabelledBy
			);
			navigationDrawerSlot.setAttribute(
				'aria-description',
				accessibility.ariaDescription
			);
		}
	}, [accessibility]);

	return (
		<mdui-navigation-drawer ref={componentRef} {...props}>
			{children}
		</mdui-navigation-drawer>
	);
};

export default AccessibleNavigationDrawer;
