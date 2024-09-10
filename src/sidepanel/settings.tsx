// src/pages/settings.tsx
import React from 'react';
import './settings.css';

const SettingsPage: React.FC = () => {
	const [apiKey, setApiKey] = React.useState('');
	const [language, setLanguage] = React.useState('en');
	const [threshold, setThreshold] = React.useState(0.5);
	const [purpose, setPurpose] = React.useState('');

	const handleConfirm = () => {
		// Handle confirm action
		console.log('Settings confirmed:', { apiKey, language, threshold, purpose });
	};

	const handleCancel = () => {
		// Handle cancel action
		console.log('Settings canceled');
	};

	return (
		<div id="settings" className="settings">
			<h1>Settings</h1>
			<label htmlFor="apiKey">Token:</label>
			<input
				type="text"
				id="apiKey"
				name="apiKey"
				value={apiKey}
				onChange={(e) => setApiKey(e.target.value)}
			/>
			<label htmlFor="language">Language:</label>
			<select
				id="language"
				name="language"
				value={language}
				onChange={(e) => setLanguage(e.target.value)}
			>
				<option value="cn">Chinese</option>
				<option value="en">English</option>
			</select>
			<label htmlFor="threshold">Speed:</label>
			<input
				type="range"
				id="threshold"
				name="threshold"
				min="0"
				max="1"
				step="0.1"
				value={threshold}
				onChange={(e) => setThreshold(parseFloat(e.target.value))}
			/>
			<label htmlFor="purpose">Purpose:</label>
			<input
				type="text"
				id="purpose"
				name="purpose"
				value={purpose}
				onChange={(e) => setPurpose(e.target.value)}
			/>
			<div className="buttons">
				<button type="button" id="confirmButton" onClick={handleConfirm}>Confirm</button>
				<button type="button" id="cancelButton" onClick={handleCancel} className="cancel">Cancel</button>
			</div>
		</div>
	);
};

export default SettingsPage;
