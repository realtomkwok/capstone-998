import ReactDOM from 'react-dom/client';
import React from 'react';
import './global.css';
import Sidepanel from './sidepanel/sidepanel';
import { SettingsProvider } from '@components/settings-context';

const root = ReactDOM.createRoot(document.getElementById('app') as HTMLElement);
root.render(
	<React.StrictMode>
		<SettingsProvider>
			<div className={'font-sans font-regular'}>
				<Sidepanel />
			</div>
		</SettingsProvider>
	</React.StrictMode>
);
