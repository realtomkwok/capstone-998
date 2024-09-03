import Sidepanel from './components/sidepanel/sidepanel';
import ReactDOM from 'react-dom/client';
import React from 'react';
import './global.css';

const root = ReactDOM.createRoot(document.getElementById('app') as HTMLElement);
root.render(
	<React.StrictMode>
		<div className={'font-sans font-regular'}>
			<Sidepanel />
		</div>
	</React.StrictMode>,
);
