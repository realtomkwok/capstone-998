// Import dependencies
import React, { useEffect, useState } from 'react';

import 'mdui';
import 'mdui/mdui.css';

// Import pages
import Main from './pages/main';
import { MaterialSymbol } from '@components/material-symbol';
import { SettingsModal } from './pages/settings';
import AccessibleButtonIcon from '@components/accessible/ButtonIcon';
const TopAppBar: React.FC<{ onOpenSettings: () => void }> = ({
	onOpenSettings,
}) => {
	return (
		<mdui-top-app-bar
			variant="small"
			className="flex flex-row items-center justify-between"
			role="banner"
			aria-label="Clara app toolbar"
		>
			<div className="flex flex-row gap-2 items-center">
				<MaterialSymbol
					symbol="family_star"
					fill={true}
					weight={400}
					grade={200}
					opticalSize={24}
					role="presentation"
				/>
				<mdui-top-app-bar-title
					className="font-semibold"
					aria-label="Press Tab to start using Clara"
					role="title"
				>
					Clara
				</mdui-top-app-bar-title>
			</div>
			<div className="flex-1" aria-hidden={true}></div>
			{/* TODO: Add keyboard shortcut to open settings */}
			<AccessibleButtonIcon
				icon="tune"
				onClick={onOpenSettings}
				className="mr-4"
				role="button"
				ariaLabel="Open settings to change Clara preferences"
				ariaDescription="You can change Clara's settings by clicking here, including language, voice, and speed."
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
		<mdui-layout full-height className='font-medium' role='main' aria-label="Hi I'm Clara!">
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
