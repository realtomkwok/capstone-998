import React from 'react';
import { FontVariationSettings, MaterialSymbolProps } from '@lib/interface';

export const MaterialSymbol: React.FC<MaterialSymbolProps> = ({
	symbol,
	weight,
	fill=false,
	grade,
	opticalSize,
}) => {
	const fontVariationSettings: FontVariationSettings = {
		FILL: fill ? 1 : 0,
		wght: weight,
		GRAD: grade,
		opsz: opticalSize,
	};

	return (
		<span
			style={{
				fontVariationSettings: `'FILL' ${fontVariationSettings.FILL}, 'wght' ${fontVariationSettings.wght}, 'GRAD' ${fontVariationSettings.GRAD}, 'opsz' ${fontVariationSettings.opsz}`,
			}}
			className="m-2 material-symbols-rounded"
		>
			{symbol}
		</span>
	);
};
