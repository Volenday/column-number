import React, { memo, Suspense } from 'react';
import { Skeleton } from 'antd';
import prettyBytes from 'pretty-bytes';

const browser = typeof process.browser !== 'undefined' ? process.browser : true;

import Filter from './filter';

const ColumnNumber = ({ format = [], id, list = [], fileSize, loading = false, ...defaultProps }) => {
	return {
		...defaultProps,
		Cell: props =>
			browser ? (
				<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
					<Cell {...props} other={{ fileSize, format }} />
				</Suspense>
			) : null,
		Filter: props =>
			browser ? (
				<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
					<Filter {...props} other={{ fileSize, id, list }} loading={loading} />
				</Suspense>
			) : null
	};
};

const Cell = memo(({ other: { fileSize, format }, value }) => {
	if (typeof value === 'undefined') return null;

	if (fileSize) return <span>{prettyBytes(value ? value : 0)}</span>;

	if (format.length !== 0) {
		const Cleave = require('cleave.js/react');
		const CurrencyInput = require('react-currency-input').default;
		const withCurrency = !!format.filter(d => d.type === 'currency').length;

		if (withCurrency) {
			const { decimalSeparator, prefix, sign, suffix, thousandSeparator } = format[0];
			return (
				<CurrencyInput
					className="ant-input"
					decimalSeparator={decimalSeparator}
					disabled={true}
					prefix={prefix ? sign : ''}
					style={{ border: 'none', backgroundColor: 'transparent' }}
					suffix={suffix ? sign : ''}
					thousandSeparator={thousandSeparator}
					value={value}
				/>
			);
		}

		let blocks = format.map(d => parseInt(d.characterLength)),
			delimiters = format.map(d => d.delimiter);
		delimiters.pop();
		return (
			<Cleave
				disabled={true}
				options={{ delimiters, blocks, numericOnly: true }}
				value={value}
				style={{ border: 'none', backgroundColor: 'transparent' }}
			/>
		);
	}

	return <span>{value}</span>;
});

export default ColumnNumber;
