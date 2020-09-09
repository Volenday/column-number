import React, { memo, Suspense, useRef } from 'react';
import { Skeleton } from 'antd';
import Cleave from 'cleave.js/react';
import prettyBytes from 'pretty-bytes';
import { Controller, useForm } from 'react-hook-form';
import InputNumber from '@volenday/input-number';

import './styles.css';

export default ({ editable = false, format = [], id, multiple = false, onChange, fileSize, ...defaultProps }) => {
	return {
		...defaultProps,
		Cell: props => (
			<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
				<Cell {...props} other={{ editable, fileSize, format, id, multiple, onChange }} />
			</Suspense>
		),
		Filter: props => (
			<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
				<Filter {...props} />
			</Suspense>
		)
	};
};

const Cell = memo(({ other: { editable, fileSize, format, id, multiple, onChange }, row: { original }, value }) => {
	if (typeof value === 'undefined') return null;

	if (fileSize) return <span>{prettyBytes(value ? value : 0)}</span>;

	if (editable && !multiple) {
		const formRef = useRef();
		const originalValue = value;
		const { control, handleSubmit } = useForm({ defaultValues: { [id]: value } });
		const onSubmit = values => onChange({ ...values, Id: original.Id });

		return (
			<form onSubmit={handleSubmit(onSubmit)} ref={formRef}>
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
		let blocks = format.map(d => parseInt(d.characterLength)),
			delimiters = format.map(d => d.delimiter);
		delimiters.pop();
		return (
			<Cleave
				disabled={true}
				options={{ delimiters, blocks, numericOnly: true }}
				value={value}
				style={{ padding: 0, border: 'none', backgroundColor: 'transparent' }}
			/>
		);
	}

	return <span>{value}</span>;
});

const Filter = memo(({ column: { filterValue, setFilter } }) => {
	let timeout = null;

	const formRef = useRef();
	const { control, handleSubmit } = useForm({ defaultValues: { filter: filterValue ? filterValue : '' } });
	const onSubmit = values => setFilter(values.filter);

	return (
		<form onSubmit={handleSubmit(onSubmit)} ref={formRef}>
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
