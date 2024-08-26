// Import dependencies
import React from 'react';

// Import stylesheets
import 'mdui';
import 'mdui/mdui.css';
import '@components/sidepanel/sidepanel.css';

const Sidepanel: React.FC = () => {
	return (
		<mdui-layout full-height={true}>
			<mdui-top-app-bar>
				<mdui-button-icon icon="menu"></mdui-button-icon>
				<mdui-top-app-bar-title>Title</mdui-top-app-bar-title>
			</mdui-top-app-bar>
		</mdui-layout>
	);
};

export default Sidepanel;
