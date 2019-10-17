import React from 'react';
import Cleave from 'cleave.js/react';
import InputNumber from '@volenday/input-number';
import prettyBytes from 'pretty-bytes';
import { Formik } from 'formik';

import './styles.css';

export default props => {
	const {
		editable = false,
		format = [],
		headerStyle = {},
		id,
		multiple = false,
		onChange,
		onChangeText,
		style = {},
		fileSize,
		...defaultProps
	} = props;

	return {
		...defaultProps,
		style: { ...style, display: 'flex', alignItems: 'center' },
		headerStyle: { ...headerStyle, display: 'flex', alignItems: 'center' },
		Cell: ({ original, value }) => {
			if (fileSize) {
				return <span>{prettyBytes(value ? value : 0)}</span>;
			}

			if (editable && !multiple) {
				return (
					<Formik
						enableReinitialize={true}
						initialValues={{ [id]: value }}
						onSubmit={values => onChange({ ...values, Id: original.Id })}
						validateOnBlur={false}
						validateOnChange={false}
						render={({ handleChange, submitForm, values }) => (
							<InputNumber
								format={format}
								id={id}
								onBlur={submitForm}
								onChange={handleChange}
								onPressEnter={e => {
									submitForm(e);
									e.target.blur();
								}}
								withLabel={false}
								value={values[id]}
							/>
						)}
					/>
				);
			}

			if (format.length != 0) {
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
		},
		Filter: ({ filter, onChange }) => {
			return (
				<Formik
					enableReinitialize={true}
					initialValues={{ filter: filter ? filter.value : '' }}
					onSubmit={values => onChange(values.filter)}
					validateOnBlur={false}
					validateOnChange={false}
					render={({ handleChange, submitForm, values }) => (
						<InputNumber
							id="filter"
							onBlur={submitForm}
							onChange={e => {
								handleChange(e);
								if (values.filter != '' && e.target.value == '') submitForm(e);
							}}
							onPressEnter={submitForm}
							placeholder="Search..."
							withLabel={false}
							value={values.filter}
						/>
					)}
				/>
			);
		}
	};
};
