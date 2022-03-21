import React, { memo, Suspense, useRef } from 'react';
import { Skeleton } from 'antd';
import prettyBytes from 'pretty-bytes';
import reactStringReplace from 'react-string-replace';
import striptags from 'striptags';

const browser = typeof process.browser !== 'undefined' ? process.browser : true;

if (browser) require('./style.css');
import Filter from './filter';

const ColumnNumber = ({
	editable = false,
	format = [],
	id,
	list = [],
	loading = false,
	multiple = false,
	onChange,
	fileSize,
	keywords,
	...defaultProps
}) => {
	return {
		...defaultProps,
		Cell: props =>
			browser ? (
				<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
					<Cell {...props} other={{ editable, fileSize, format, id, multiple, onChange, keywords }} />
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

const removeHTMLEntities = (text, multiple) => {
	const elem = multiple ? document.createElement('div') : document.createElement('span');
	return text.replace(/&[#A-Za-z0-9]+;/gi, entity => {
		elem.innerHTML = entity;
		return elem.innerText;
	});
};

const highlightsKeywords = (keywords, stripHTMLTags = false, toConvert, multiple) => {
	const strip = stripHTMLTags ? removeHTMLEntities(striptags(toConvert), multiple) : toConvert;

	const replaceText =
		keywords !== '' ? (
			reactStringReplace(strip, new RegExp('(' + keywords + ')', 'gi'), (match, index) => {
				return multiple ? (
					<div key={`${match}-${index}`} style={{ backgroundColor: 'yellow', fontWeight: 'bold' }}>
						{match}
					</div>
				) : (
					<span key={`${match}-${index}`} style={{ backgroundColor: 'yellow', fontWeight: 'bold' }}>
						{match}
					</span>
				);
			})
		) : multiple ? (
			<div>{strip}</div>
		) : (
			<span>{strip}</span>
		);

	return replaceText;
};

const Cell = memo(
	({ other: { editable, fileSize, format, id, multiple, onChange, keywords }, row: { original }, value }) => {
		const InputNumber = require('@volenday/input-number').default;
		const { Controller, useForm } = require('react-hook-form');
		if (typeof value === 'undefined') return null;

		if (fileSize) return <span>{prettyBytes(value ? value : 0)}</span>;

		if (editable && !multiple) {
			const formRef = useRef();
			const originalValue = value;
			const { control, handleSubmit } = useForm({ defaultValues: { [id]: value } });
			const onSubmit = values => onChange({ ...values, Id: original.Id });

			return (
				<form onSubmit={handleSubmit(onSubmit)} ref={formRef} style={{ width: '100%' }}>
					<Controller
						control={control}
						name={id}
						render={({ onChange, name, value }) => (
							<InputNumber
								format={format}
								id={name}
								onBlur={() =>
									originalValue !== value &&
									formRef.current.dispatchEvent(new Event('submit', { cancelable: true }))
								}
								onChange={e => onChange(e.target.value)}
								onPressEnter={e => e.target.blur()}
								withLabel={false}
								value={value}
							/>
						)}
					/>
				</form>
			);
		}

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

		return highlightsKeywords(keywords, false, value.toString());
	}
);

export default ColumnNumber;
