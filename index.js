import React, { memo, Suspense, useRef } from 'react';
import { Skeleton } from 'antd';
import prettyBytes from 'pretty-bytes';

import './styles.css';

const browser = typeof process.browser !== 'undefined' ? process.browser : true;

export default ({ editable = false, format = [], id, multiple = false, onChange, fileSize, ...defaultProps }) => {
	return {
		...defaultProps,
		Cell: props =>
			browser ? (
				<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
					<Cell {...props} other={{ editable, fileSize, format, id, multiple, onChange }} />
				</Suspense>
			) : null,
		Filter: props =>
			browser ? (
				<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
					<Filter {...props} />
				</Suspense>
			) : null
	};
};

const Cell = memo(({ other: { editable, fileSize, format, id, multiple, onChange }, row: { original }, value }) => {
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
		const CurrencyInput = require('react-currency-input');
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

const Filter = memo(({ column: { filterValue, setFilter } }) => {
	const InputNumber = require('@volenday/input-number').default;
	const { Controller, useForm } = require('react-hook-form');
	let timeout = null;

	const formRef = useRef();
	const { control, handleSubmit } = useForm({ defaultValues: { filter: filterValue ? filterValue : '' } });
	const onSubmit = values => setFilter(values.filter);

	return (
		<form onSubmit={handleSubmit(onSubmit)} ref={formRef} style={{ width: '100%' }}>
			<Controller
				control={control}
				name="filter"
				render={({ onChange, value, name }) => (
					<InputNumber
						id={name}
						onChange={e => {
							onChange(e.target.value);
							if (value !== '' && e.target.value === '') {
								formRef.current.dispatchEvent(new Event('submit', { cancelable: true }));
							} else {
								timeout && clearTimeout(timeout);
								timeout = setTimeout(
									() => formRef.current.dispatchEvent(new Event('submit', { cancelable: true })),
									300
								);
							}
						}}
						onPressEnter={() => formRef.current.dispatchEvent(new Event('submit', { cancelable: true }))}
						placeholder="Search..."
						withLabel={false}
						value={value}
					/>
				)}
			/>
		</form>
	);
});
