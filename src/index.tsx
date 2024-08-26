import Sidepanel from './components/sidepanel/sidepanel';
import ReactDOM from 'react-dom/client';
import React from 'react';

const root = ReactDOM.createRoot(document.getElementById('app') as HTMLElement);
root.render(
	<React.StrictMode>
		<Sidepanel />
	</React.StrictMode>,
);
