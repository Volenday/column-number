import React from 'react';
import InputNumber from '@volenday/input-number';
import { Formik } from 'formik';

import './styles.css';

export default ({ editable = false, format = [], id, multiple = false, onChange, fileSize, ...defaultProps }) => {
	return {
		...defaultProps,
		Cell: ({ row, value }) => {
			if (typeof value == 'undefined') return null;

			if (fileSize) {
				const prettyBytes = require('pretty-bytes');
				return <span>{prettyBytes(value ? value : 0)}</span>;
			}

			if (editable && !multiple) {
				return (
					<Formik
						enableReinitialize={true}
						initialValues={{ [id]: value }}
						onSubmit={values => onChange({ ...values, Id: row.Id })}
						validateOnBlur={false}
						validateOnChange={false}>
						{({ handleChange, submitForm, values }) => (
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
					</Formik>
				);
			}

			if (format.length !== 0) {
				const Cleave = require('cleave.js/react');

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
		Filter: ({ column: { filterValue, setFilter } }) => {
			let timeout = null;

			return (
				<Formik
					enableReinitialize={true}
					initialValues={{ filter: filterValue ? filterValue : '' }}
					onSubmit={values => setFilter(values.filter)}
					validateOnBlur={false}
					validateOnChange={false}>
					{({ handleChange, submitForm, values }) => (
						<InputNumber
							id="filter"
							onChange={e => {
								handleChange(e);
								if (values.filter != '' && e.target.value == '') {
									submitForm(e);
								} else {
									timeout && clearTimeout(timeout);
									timeout = setTimeout(() => submitForm(e), 300);
								}
							}}
							onPressEnter={submitForm}
							placeholder="Search..."
							withLabel={false}
							value={values.filter}
						/>
					)}
				</Formik>
			);
		}
	};
};
