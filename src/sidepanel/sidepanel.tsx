// Import dependencies
import React, { useEffect, useState } from 'react';

import 'mdui';
import 'mdui/mdui.css';

// Import pages
import Main from './pages/main';
import { MaterialSymbol } from '@components/material-symbol';
import { SettingsModal } from './pages/settings';

const TopAppBar: React.FC<{ onOpenSettings: () => void }> = ({
	onOpenSettings,
}) => {
	return (
		<mdui-top-app-bar variant="small">
			<MaterialSymbol
				symbol="family_star"
				fill={true}
				weight={400}
				grade={200}
				opticalSize={24}
			/>
			<mdui-top-app-bar-title className="font-semibold">
				Clara Dev
			</mdui-top-app-bar-title>
			<mdui-button-icon
				icon="tune"
				onClick={onOpenSettings}
				aria-label="Open Settings"
				className="mr-4"
			></mdui-button-icon>
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
		<mdui-layout full-height className={'font-medium'}>
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
