// Import dependencies
import React, { useEffect, useState } from 'react';

import 'mdui';
import 'mdui/mdui.css';

// Import pages
import Main from './pages/main';
import { MaterialSymbol } from '@components/material-symbol';
import { SettingsModal } from './pages/settings';
import AccessibleButtonIcon from '@components/accessible/ButtonIcon';
import { SETTINGS_BUTTON, TOP_APP_BAR } from '@lib/accessible-labels';


const TopAppBar: React.FC<{ onOpenSettings: () => void }> = ({
	onOpenSettings,
}) => {
	return (
		<mdui-top-app-bar
			variant="small"
			className="flex flex-row items-center justify-between"
			role="banner"
			aria-label={TOP_APP_BAR.ariaLabel}
			aria-description={TOP_APP_BAR.ariaDescription}
		>
			<div className="flex content-center items-center w-10 h-10">
				<img
					src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman.png"
					alt="Woman"
					width="64"
					height="64"
				/>
			</div>
			<mdui-top-app-bar-title
				className="font-semibold"
				aria-label="Clara"
				role="title"
			>
				Clara
			</mdui-top-app-bar-title>
			<div className="flex-1" aria-hidden={true} />
			{/* TODO: Add keyboard shortcut to open settings */}
			<AccessibleButtonIcon
				icon="tune"
				onClick={onOpenSettings}
				className="mr-4"
				role="button"
				ariaLabel={SETTINGS_BUTTON.ariaLabel}
				ariaDescription={SETTINGS_BUTTON.ariaDescription}
			/>
		</mdui-top-app-bar>
	);
};

const Sidepanel: React.FC = () => {
	// TODO: set up state for chats

	// State to control the visibility of the settings modal
	const [showSettings, setShowSettings] = useState<boolean>(false);

	// Handler to toggle the settings modal
	const toggleSettingsModal = () => setShowSettings((prev) => !prev);

	return (
		<mdui-layout full-height className='font-medium' role='main' aria-label="Application">
			{/* Top App Bar */}
			<TopAppBar onOpenSettings={toggleSettingsModal} />
			{/* Main Content Area*/}
			<Main />
			{/* Settings Modal */}
			<SettingsModal
				isOpen={showSettings}
				onClose={toggleSettingsModal}
			/>
		</mdui-layout>
	);
};
export default Sidepanel;
