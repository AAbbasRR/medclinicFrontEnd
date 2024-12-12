import { yupResolver } from "@hookform/resolvers/yup";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import IconDelete from "src/assets/icons/icon-delete.svg";
import { Button } from "src/components/Button";
import { DatePicker } from "src/components/DatePicker";
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
		date: string().required(translate.errors.required),
		time: string().required(translate.errors.required),
		is_active: boolean().required(translate.errors.required),
	});

const DateTimesModal = ({ open, setOpen, doctor, setDoctor }) => {
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

	const [loading, setLoading] = useState(false);
	const [dateTimeRows, setDateTimeRows] = useState([]);
	const [reload, setReload] = useState(false);

	const getDoctorTimesData = () => {
		setLoading(true);
		axios
			.get(`/admin/doctor/datetime/list-create/?doctor=${doctor}`)
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
	const onSubmit = (data) => {
		data.time = new Date(data.time).toLocaleTimeString("fa-IR", {
			hour: "2-digit",
			minute: "2-digit",
		});
		data.doctor = doctor;
		const doctor_date = new Date(data?.date).toLocaleDateString("en-GB");
		const [day, month, year] = doctor_date.split("/");
		const isoDate = `${year}-${month}-${day}`;
		data.date = isoDate;
		axios
			.post("/admin/doctor/datetime/list-create/", data)
			.then((res) => {
				reset();
				setReload(!reload);
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
				setReload(!reload);
			})
			.catch((err) => {
				handleError({ err });
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		if (doctor !== null) {
			getDoctorTimesData();
		}
	}, [doctor, reload]);

	const columns = [
		{
			headerName: "تاریخ",
			field: "date",
			flex: 1,
			minWidth: 150,
			sortable: false,
			renderCell: ({ row }) => new Date(row?.date).toLocaleString("fa-IR").split(", ")[0],
		},
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
				<div>
					<form className={style.form}>
						<div className={style.form__inputFull}>
							<Typography variant="h6">ایجاد کردن زمان</Typography>
						</div>
						<DatePicker
							size="xlarge"
							label="تاریخ"
							error={errors?.date?.message}
							className={`${style.form__input}`}
							name="date"
							control={control}
						/>
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
					<Box sx={{ p: 3 }}>
						{dateTimeRows?.length > 0 ? (
							<div className={style.table}>
								<Table rows={dateTimeRows} loading={loading} columns={columns} paginationDisabled />
							</div>
						) : loading ? (
							<Spin size={50} />
						) : (
							<Empty />
						)}
					</Box>
				</div>
			</Box>
		</Modal>
	);
};

export default DateTimesModal;
