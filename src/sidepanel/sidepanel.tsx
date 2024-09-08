// Import dependencies
import React from 'react';

import 'mdui';
import 'mdui/mdui.css';
import './sidepanel.css';

// Import pages
import Main from './pages/main';

const Sidepanel: React.FC = () => {
	return (
		<mdui-layout full-height className={'font-medium'}>
			<mdui-top-app-bar>
				<mdui-button-icon icon="menu"></mdui-button-icon>
				<mdui-top-app-bar-title className="font-semibold">
					Clara Dev
				</mdui-top-app-bar-title>
				<mdui-button-icon icon="tune"></mdui-button-icon>
			</mdui-top-app-bar>
			<Main />
		</mdui-layout>
	);
};
export default Sidepanel;
