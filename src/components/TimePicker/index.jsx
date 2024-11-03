import { ThemeProvider, createTheme } from "@mui/material/styles";
import useTheme from "@mui/system/useTheme";
import { AdapterDateFnsJalali } from "@mui/x-date-pickers/AdapterDateFnsJalaliV3";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker as MuiTimePicker } from "@mui/x-date-pickers/TimePicker";
import { forwardRef, useMemo } from "react";
import { Controller } from "react-hook-form";
import style from "./style.module.scss";

function AdapterJalali(props, ref) {
	const existingTheme = useTheme();
	const theme = useMemo(() => createTheme({ direction: "rtl" }, existingTheme), [existingTheme]);
	const {
		size,
		label = "",
		error = "",
		className = "",
		helperText = "",
		required = false,
		name,
		control,
		placeholder = "",
		children,
		...rest
	} = props;
	const sizeClass = size ? style[`input_${size}`] : "";

	return (
		<ThemeProvider theme={theme}>
			<div className={`${style.input} ${sizeClass} ${className || ""} ${error ? "error" : ""}`}>
				{label && (
					<label className={style.input__label}>
						{label} {required && <span className={style.input__require}>*</span>}
					</label>
				)}

				<LocalizationProvider
					dateAdapter={AdapterDateFnsJalali}
					localeText={{
						okButtonLabel: "تایید",
						cancelButtonLabel: "انصراف",
						datePickerToolbarTitle: "انتخاب زمان",
					}}
				>
					<Controller
						control={control}
						name={name}
						rules={{ required: required }}
						render={({ field }) => {
							return (
								<MuiTimePicker
									label="Time"
									value={field.value}
									inputRef={field.ref}
									format="HH:mm"
									onChange={(date) => {
										field.onChange(date);
									}}
									onBlur={(date) => {
										field.onBlur(date);
									}}
									ampm={false}
								/>
							);
						}}
					/>
				</LocalizationProvider>

				{(error || helperText) && (
					<div className={style.input__help}>
						{(helperText || error) && (
							<span className={style.input__helpText}>{error || helperText}</span>
						)}
					</div>
				)}
			</div>
		</ThemeProvider>
	);
}

export const TimePicker = forwardRef(AdapterJalali);
