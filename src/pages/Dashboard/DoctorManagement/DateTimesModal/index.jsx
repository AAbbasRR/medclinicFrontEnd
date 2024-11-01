import { yupResolver } from "@hookform/resolvers/yup";
import { Box, IconButton, Tab, Tabs, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import IconDelete from "src/assets/icons/icon-delete.svg";
import { Button } from "src/components/Button";
import { Empty } from "src/components/Empty";
import { Modal } from "src/components/Modal";
import { Spin } from "src/components/Spin";
import { Switch } from "src/components/Switch";
import { Table } from "src/components/Table";
import { TimePicker } from "src/components/TimePicker";
import { handleError } from "src/utils/api-error-handling";
import axios from "src/utils/axios";
import { translate } from "src/utils/translate";
import { boolean, object, string } from "yup";
import style from "./style.module.scss";

const schema = () =>
	object({
		time: string().required(translate.errors.required),
		is_active: boolean().required(translate.errors.required),
	});

function CustomTabPanel(props) {
	const { loading, setLoading, doctor, label, rows, relaod, setReload, value, index, ...other } =
		props;
	const {
		control,
		setError,
		watch,
		setValue,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		mode: "onChange",
		resolver: yupResolver(schema()),
		defaultValues: {
			is_active: true,
		},
	});

	const onSubmit = (data) => {
		data.time = new Date(data.time).toLocaleTimeString("fa-IR", {
			hour: "2-digit",
			minute: "2-digit",
		});
		data.doctor = doctor;
		data.day_of_week = label;
		axios
			.post("/admin/doctor/datetime/list-create/", data)
			.then((res) => {
				reset();
				setReload(!relaod);
			})
			.catch((err) => {
				handleError({ err, setError });
			})
			.finally(() => setLoading(false));
	};
	const deleteAdmin = (id) => {
		setLoading(true);
		axios
			.delete("/admin/doctor/datetime/update-delete/", {
				params: { pk: id },
			})
			.then((res) => {
				setReload(!relaod);
			})
			.catch((err) => {
				handleError({ err });
			})
			.finally(() => setLoading(false));
	};

	const columns = [
		{
			headerName: "زمان",
			field: "time",
			flex: 1,
			minWidth: 150,
			sortable: false,
		},
		{
			headerName: "فعال؟",
			field: "is_active",
			flex: 1,
			minWidth: 100,
			sortable: false,
			renderCell: ({ row }) => (row?.is_active ? "بله" : "خیر"),
		},
		{
			headerName: "",
			field: "action",
			sortable: false,
			flex: 1,
			minWidth: 100,
			renderCell: ({ row }) => (
				<div className={style.row}>
					<Tooltip title="حذف کردن">
						<IconButton className={style.IconButton} onClick={() => deleteAdmin(row?.id)}>
							<img src={IconDelete} alt="delete-icon" />
						</IconButton>
					</Tooltip>
				</div>
			),
		},
	];

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box sx={{ p: 3 }}>
					{rows?.length > 0 ? (
						<div className={style.table}>
							<Table rows={rows} loading={loading} columns={columns} paginationDisabled />
						</div>
					) : loading ? (
						<Spin size={50} />
					) : (
						<Empty />
					)}
				</Box>
			)}
			<form className={style.form}>
				<div className={style.form__inputFull}>
					<Typography variant="h6">ایجاد کردن زمان</Typography>
				</div>
				<TimePicker
					size="xlarge"
					label="زمان"
					error={errors?.time?.message}
					className={`${style.form__input}`}
					name="time"
					control={control}
				/>
				<div className={`${style.form__input} ${style.form__inputSwitch}`}>
					فعال؟
					<Switch
						name="is_active"
						checked={watch("is_active")}
						onChange={(e) => setValue("is_active", e.target.checked)}
					/>
				</div>
				<Button onClick={handleSubmit(onSubmit)} size="xlarge" className={style.form__input}>
					ثبت کردن
				</Button>
			</form>
		</div>
	);
}

function a11yProps(index) {
	return {
		id: `simple-tab-${index}`,
		"aria-controls": `simple-tabpanel-${index}`,
	};
}

const tabData = [
	{ label: "شنبه", value: 0 },
	{ label: "یکشنبه", value: 1 },
	{ label: "دوشنبه", value: 2 },
	{ label: "سشنبه", value: 3 },
	{ label: "چهارشنبه", value: 4 },
	{ label: "پنجشنبه", value: 5 },
	{ label: "جمعه", value: 6 },
];

const DateTimesModal = ({ open, setOpen, doctor, setDoctor }) => {
	const [loading, setLoading] = useState(false);
	const [tabValue, setTabValue] = useState(0);
	const [tabLabel, setTabLabel] = useState("شنبه");
	const [dateTimeRows, setDateTimeRows] = useState([]);
	const [reload, setReload] = useState(false);

	const tabChange = (event, newValue) => {
		setTabValue(newValue);
		const label = tabData.find((item) => item.value === newValue);
		setTabLabel(label.label);
	};

	const getDoctorTimesData = () => {
		setLoading(true);
		axios
			.get(`/admin/doctor/datetime/list-create/?doctor=${doctor}&day_of_week=${tabLabel}`)
			.then((res) => {
				setDateTimeRows(res?.data);
			})
			.catch((err) => {
				handleError({ err });
			})
			.finally(() => setLoading(false));
	};
	const closeModal = () => {
		setOpen(false);
		setDoctor(null);
	};

	useEffect(() => {
		if (doctor !== null) {
			getDoctorTimesData();
		}
	}, [tabValue, doctor, reload]);

	return (
		<Modal
			fullWidth
			state={open}
			setState={closeModal}
			maxWidth="md"
			footerEnd={
				<div className={style.buttons}>
					<Button size="xlarge" variant="ghost" onClick={closeModal}>
						انصراف
					</Button>
				</div>
			}
		>
			<Box sx={{ width: "100%" }}>
				<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
					<Tabs value={tabValue} onChange={tabChange} aria-label="basic tabs example">
						{tabData.map((item, index) => (
							<Tab key={index} label={item?.label} {...a11yProps(item?.value)} />
						))}
					</Tabs>
				</Box>
				{tabData.map((item, index) => (
					<CustomTabPanel
						value={tabValue}
						doctor={doctor}
						label={tabLabel}
						index={item?.value}
						rows={dateTimeRows}
						loading={loading}
						setLoading={setLoading}
						relaod={reload}
						setReload={setReload}
					/>
				))}
			</Box>
		</Modal>
	);
};

export default DateTimesModal;
