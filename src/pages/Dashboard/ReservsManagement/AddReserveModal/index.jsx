import { yupResolver } from "@hookform/resolvers/yup";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "src/components/Button";
import { DatePicker } from "src/components/DatePicker";
import { Input } from "src/components/Input";
import { Modal } from "src/components/Modal";
import { Select } from "src/components/Select";
import { handleError } from "src/utils/api-error-handling";
import axios from "src/utils/axios";
import { translate } from "src/utils/translate";
import { object, string } from "yup";
import style from "./style.module.scss";

const schema = () =>
	object({
		full_name: string().required(translate.errors.required),
		mobile_number: string().required(translate.errors.required),
		doctor: string().required(translate.errors.required),
		date: string().required(translate.errors.required),
		time: string().required(translate.errors.required),
	});

const AddReserveModal = ({ open, setOpen, reload, setReload }) => {
	const {
		control,
		setError,
		watch,
		handleSubmit,
		reset,
		register,
		formState: { errors },
	} = useForm({
		mode: "onChange",
		resolver: yupResolver(schema()),
		defaultValues: {
			doctor: null,
			date: null,
			time: null,
		},
	});
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const [loading, setLoading] = useState(false);
	const [doctorsData, setDoctorsData] = useState([]);
	const [dayTimesData, setDayTimesData] = useState([]);

	const getDoctorsList = () => {
		setLoading(true);
		axios
			.get("/public/doctor/list/")
			.then((res) => {
				const valueOptions = [];
				res?.data?.map((item) => {
					valueOptions.push({
						name: `${item?.field}: ${item?.name}`,
						value: String(item?.id),
					});
				});
				setDoctorsData(valueOptions);
			})
			.catch((err) => {
				handleError({ err });
			})
			.finally(() => setLoading(false));
	};
	const getDoctorDays = () => {
		setLoading(true);
		const doctor_date = new Date(watch("date")).toLocaleDateString("en-GB");
		const [day, month, year] = doctor_date.split("/");
		const isoDate = `${year}-${month}-${day}`;
		axios
			.get(`/public/doctor/datetime/list/?doctor=${watch("doctor")}&date=${isoDate}`)
			.then((res) => {
				const valueOptions = [];
				res?.data?.map((item) => {
					if (item?.is_active) {
						valueOptions.push({
							name: item?.time,
							value: item?.time,
						});
					}
				});
				setDayTimesData(valueOptions);
			})
			.catch((err) => {
				handleError({ err });
			})
			.finally(() => setLoading(false));
	};
	const closeModal = () => {
		setOpen(false);
		reset();
	};
	const onSubmit = (data) => {
		setLoading(true);
		const doctor_date = new Date(data?.date).toLocaleDateString("en-GB");
		const [day, month, year] = doctor_date.split("/");
		const isoDate = `${year}-${month}-${day}`;
		data.date = isoDate;
		axios
			.post("/admin/reservations/create/", data)
			.then((res) => {
				reset();
				setDayTimesData([]);
				setReload(!reload);
				setOpen(false);
			})
			.catch((err) => {
				handleError({ err, setError });
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		getDoctorsList();
	}, []);
	useEffect(() => {
		if (watch("date") !== null) {
			getDoctorDays();
		}
	}, [watch("date")]);

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
					<Button onClick={handleSubmit(onSubmit)} size="xlarge" loading={loading}>
						ثبت کردن
					</Button>
				</div>
			}
		>
			<Box sx={{ width: "100%" }}>
				<div>
					<form className={style.form}>
						<Input
							className={style.form__input}
							required
							size="xlarge"
							label="نام و نام خانوادگی"
							error={errors.full_name?.message}
							{...register("full_name")}
						/>
						<Input
							className={style.form__input}
							required
							size="xlarge"
							label="شماره موبایل"
							error={errors.mobile_number?.message}
							{...register("mobile_number")}
						/>
						<Select
							className={style.form__inputFull}
							size="xlarge"
							label="دکتر و متخصص"
							required
							options={doctorsData}
							error={errors.doctor?.message}
							name="doctor"
							control={control}
						/>
						{watch("doctor") !== null && (
							<>
								<DatePicker
									size="xlarge"
									label="تاریخ"
									error={errors?.date?.message}
									className={`${style.form__input}`}
									name="date"
									control={control}
									minDate={today}
									disablePast
								/>
								<Select
									className={style.form__input}
									size="xlarge"
									label="زمان"
									required
									options={dayTimesData}
									error={errors.time?.message}
									name="time"
									control={control}
								/>
							</>
						)}
					</form>
				</div>
			</Box>
		</Modal>
	);
};

export default AddReserveModal;
