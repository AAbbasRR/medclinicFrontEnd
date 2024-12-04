import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Checkbox, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import { addDays } from "date-fns";
import moment from "moment-jalaali";
import { useEffect, useState } from "react";
import Countdown from "react-countdown";
import { useForm } from "react-hook-form";
import iconInfo from "src/assets/icons/icon-info.svg";
import IconLock from "src/assets/icons/icon-lock.svg";
import { Button } from "src/components/Button";
import { Empty } from "src/components/Empty";
import { Input } from "src/components/Input";
import { Select } from "src/components/Select";
import { handleError } from "src/utils/api-error-handling";
import axios from "src/utils/axios";
import { translate } from "src/utils/translate";
import { object, string } from "yup";
import MessageModal from "./MessageModal";
import style from "./style.module.scss";

moment.loadPersian({ usePersianDigits: true, dialect: "persian-modern" });
const COUNTDOWN_TIME = 120000;

const schema = (otpSended) =>
	object({
		first_name: string().required(translate.errors.required),
		last_name: string().required(translate.errors.required),
		national_code: string().required(translate.errors.required),
		mobile_number: string().required(translate.errors.required),
		otp: otpSended ? string().required(translate.errors.required) : string(),
	});

const HomePage = () => {
	const [otpSended, setOtpSended] = useState(false);

	const {
		register,
		setError,
		reset,
		watch,
		handleSubmit,
		formState: { errors },
	} = useForm({
		mode: "onChange",
		resolver: yupResolver(schema(otpSended)),
		defaultValues: { wage: 0 },
	});
	const today = new Date();

	const [loading, setLoading] = useState(false);
	const [doctorsData, setDoctorsData] = useState([]);
	const [selectedDoctor, setSelectedDoctor] = useState(null);
	const [calendarData, setCalendarData] = useState(null);
	const [selectedDay, setSelectedDay] = useState(null);
	const [selectedDate, setSelectedDate] = useState(null);
	const [dayTimesData, setDayTimesData] = useState([]);
	const [selectedTime, setSelectedTime] = useState(null);
	const [termsChecked, setTermsChecked] = useState(false);
	const [settings, setSettings] = useState({
		activate_gateway: false,
		reserve_price: "رایگان",
		terms_content: "خالی",
	});
	const [counter, setCounter] = useState({ key: false, date: Date.now() });
	const [messageModalOpen, setMessageModalOpen] = useState(false);
	const [messageModalData, setMessageModalData] = useState({
		message: "",
		success: false,
	});

	const getCurrentWeek = () => {
		const currentMonth = moment(today).format("jMMMM");
		const currentYear = moment(today).format("jYYYY");

		const daysOfWeek = Array.from({ length: 7 }).map((_, index) => {
			const day = addDays(today, index);
			return {
				dayOfWeek: moment(day).format("dddd"),
				dayOfMonth: moment(day).format("jDD"),
			};
		});

		const result = {
			month: currentMonth,
			year: currentYear,
			week: daysOfWeek,
		};

		return result;
	};

	useEffect(() => {
		setCalendarData(getCurrentWeek());
	}, []);

	const getSettings = () => {
		setLoading(true);
		axios
			.get(`/public/settings/list/`)
			.then((res) => {
				const activate_gateway =
					res?.data?.find((item) => item.type === "activate_gateway")?.value ?? false;
				const reserve_price =
					res?.data?.find((item) => item.type === "reserve_price")?.value ?? "0";
				const terms_content =
					res?.data?.find((item) => item.type === "terms_content")?.value ?? "خالی";
				setSettings({
					activate_gateway: activate_gateway.toLowerCase() === "true",
					reserve_price: reserve_price,
					terms_content: terms_content,
				});
			})
			.catch((err) => {
				handleError({ err });
			})
			.finally(() => setLoading(false));
	};
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
		axios
			.get(`/public/doctor/datetime/list/?doctor=${selectedDoctor}&day_of_week=${selectedDay}`)
			.then((res) => {
				setDayTimesData(res?.data);
			})
			.catch((err) => {
				handleError({ err });
			})
			.finally(() => setLoading(false));
	};
	const sendOTP = (data) => {
		setLoading(true);
		axios
			.post("/public/reservations/send-otp/", data)
			.then((res) => {
				setMessageModalOpen(true);
				setMessageModalData({
					message: "کد تایید به شماره شما ارسال شد",
					success: true,
				});
				setOtpSended(true);
				setCounter((e) => ({ key: !e.key, date: Date.now() + COUNTDOWN_TIME }));
			})
			.catch((err) => {
				handleError({ err, setError });
			})
			.finally(() => setLoading(false));
	};
	const onSubmit = (data) => {
		setLoading(true);
		data.doctor = selectedDoctor;
		data.year = moment(today).format("jYYYY");
		data.month = moment(today).format("jMMMM");
		data.date = selectedDate;
		data.day_of_week = selectedDay;
		data.time = selectedTime;
		axios
			.post("/public/reservations/create/", data)
			.then((res) => {
				setMessageModalOpen(true);
				setMessageModalData({
					message: "رزرو شما با موفقیت انجام شد",
					success: true,
				});
				reset();
				setOtpSended(false);
				setCounter((e) => ({ key: !e.key, date: Date.now() }));
				setSelectedDoctor(null);
				setSelectedDay(null);
				setSelectedDate(null);
				setDayTimesData([]);
				setSelectedTime(null);
				setTermsChecked(null);
				setSettings({
					activate_gateway: false,
					reserve_price: "رایگان",
					terms_content: "خالی",
				});
			})
			.catch((err) => {
				handleError({ err, setError });
			})
			.finally(() => setLoading(false));
	};
	const Renderer = ({ minutes, seconds, completed }) => {
		if (completed) {
			setOtpSended(false);
		}
		return (
			<Button
				className={style.buttonSubmitCode}
				size="xlarge"
				onClick={handleSubmit(sendOTP)}
				loading={loading}
				disabled={!completed}
			>
				{completed ? "ارسال کد تایید" : `${minutes}:${seconds}`}
			</Button>
		);
	};

	useEffect(() => {
		getSettings();
		getDoctorsList();
	}, []);
	useEffect(() => {
		if (selectedDay !== null) {
			getDoctorDays();
		}
	}, [selectedDay]);
	return (
		<div className={style.wrapper}>
			<Paper elevation={6} className={style.paperMain}>
				<div className={style.paperMain__header}>
					<Typography className={style.paperMain__header__text} variant="h6">
						رزرو وقت در مدکلینیک
					</Typography>
				</div>
				<Grid container spacing={5} className={style.container}>
					<Grid item xs={12} lg={6}>
						<div className={style.form}>
							<Select
								className={style.form__inputFull}
								size="xlarge"
								label="دکتر و متخصص"
								required
								options={doctorsData}
								onChange={(e) => setSelectedDoctor(e.target.value)}
								value={selectedDoctor}
								name="doctor"
							/>
							{selectedDoctor && (
								<>
									<Divider sx={{ width: "100%" }} />
									<Stack className={style.calender} alignItems="center" gap={1}>
										<Typography variant="h6" color="GrayText" fontWeight="bold">
											{calendarData?.month} {calendarData?.year}
										</Typography>
										<Stack
											className={style.calender__week}
											p={1}
											direction="row"
											justifyContent="center"
										>
											{calendarData?.week.map((day, index) => (
												<Stack
													p={1}
													key={index}
													className={`${style.calender__week__dayItem} ${
														selectedDay === day?.dayOfWeek ? style.calender__week__current : ""
													}`}
													alignItems="center"
													gap={1}
													onClick={() => {
														setSelectedDay(day?.dayOfWeek);
														setSelectedDate(day?.dayOfMonth);
													}}
												>
													<Typography
														variant="caption"
														color={selectedDay === day?.dayOfWeek ? "white" : "GrayText"}
														fontWeight="bold"
														className={style.calender__week__dayItem__dayOfWeek}
													>
														{day?.dayOfWeek}
													</Typography>
													<Typography variant="h6" fontWeight="bold">
														{day?.dayOfMonth}
													</Typography>
													<Box className={style.calender__week__dot} />
												</Stack>
											))}
										</Stack>
										<Typography
											sx={{ gap: "0.2rem", display: "flex", alignItems: "center" }}
											variant="subtitle2"
											fontWeight="bold"
										>
											<img src={iconInfo} alt="icon-info" style={{ height: "1.2rem" }} />
											ابتدا روز را انتخاب و سپس زمان مورد نظر را رزرو کنید.
										</Typography>
									</Stack>
									{dayTimesData?.length >= 1 ? (
										<Grid container spacing={2} className={style.times}>
											{dayTimesData?.map((item, index) => {
												let time = item?.time.split(":");
												return (
													<Grid
														key={index}
														item
														xs={6}
														md={4}
														xl={3}
														sx={{ display: "flex", justifyContent: "center" }}
													>
														{item?.is_active ? (
															<Box
																onClick={() => setSelectedTime(item?.time)}
																className={`${style.times__time} ${
																	selectedTime === item?.time ? style.times__time__current : ""
																}`}
															>
																{[time[0], time[1]].join(":")}
															</Box>
														) : (
															<Box className={`${style.times__Disabled}`}>
																{[time[0], time[1]].join(":")}{" "}
																<img src={IconLock} alt="icon-lock" />
															</Box>
														)}
													</Grid>
												);
											})}
										</Grid>
									) : (
										<Empty />
									)}
								</>
							)}
						</div>
					</Grid>
					<Grid item xs={12} lg={6}>
						{selectedTime && (
							<>
								<form className={style.form}>
									<Input
										className={style.form__input}
										required
										size="xlarge"
										label="نام"
										error={errors.first_name?.message}
										{...register("first_name")}
									/>
									<Input
										className={style.form__input}
										required
										size="xlarge"
										label="نام خانوادگی"
										error={errors.last_name?.message}
										{...register("last_name")}
									/>
									<Input
										className={style.form__input}
										required
										size="xlarge"
										label="کد ملی"
										error={errors.national_code?.message}
										{...register("national_code")}
									/>
									<Input
										className={style.form__input}
										required
										size="xlarge"
										label="شماره موبایل"
										error={errors.mobile_number?.message}
										{...register("mobile_number")}
									/>
									{otpSended && (
										<Input
											className={style.form__inputBig}
											required
											size="xlarge"
											label="کد اعتبارسنجی"
											error={errors.otp?.message}
											{...register("otp")}
										/>
									)}
									<Countdown {...counter} renderer={Renderer} />
								</form>
								<div className={style.terms}>
									<div className={style.terms__checkbox}>
										<Checkbox
											checked={termsChecked}
											onChange={(e) => setTermsChecked(e.target.checked)}
											inputProps={{ "aria-label": "controlled" }}
										/>
										<Typography variant="subtitle2">با قوانین و شرایط زیر موافقت میکنم.</Typography>
									</div>
									<Typography variant="subtitle2">{settings?.terms_content}</Typography>
								</div>
								<div className={style.preview}>
									<Typography variant="h6" fontWeight="bold">
										اطلاعات رزرو
									</Typography>
									<div className={`${style.preview__itemWithBorder}`}>
										<Typography variant="subtitle2">نام:</Typography>
										<Typography variant="subtitle2">
											{watch("first_name")} {watch("last_name")}
										</Typography>
									</div>
									<div className={`${style.preview__itemWithBorder}`}>
										<Typography variant="subtitle2">کد ملی:</Typography>
										<Typography variant="subtitle2">{watch("national_code")}</Typography>
									</div>
									<div className={`${style.preview__itemWithBorder}`}>
										<Typography variant="subtitle2">شماره موبایل:</Typography>
										<Typography variant="subtitle2">{watch("mobile_number")}</Typography>
									</div>
									<div className={`${style.preview__itemWithBorder}`}>
										<Typography variant="subtitle2">تاریخ رزرو:</Typography>
										<Typography variant="subtitle2">{`${selectedDay} ${selectedDate} ${moment(
											today,
										).format("jMMMM")} ماه ${moment(today).format("jYYYY")}`}</Typography>
									</div>
									<div className={`${style.preview__itemWithBorder}`}>
										<Typography variant="subtitle2">ساعت رزرو:</Typography>
										<Typography variant="subtitle2">{`${selectedTime}`}</Typography>
									</div>

									<div className={`${style.preview__item}`}>
										<Typography variant="subtitle2">مبلغ قابل پرداخت:</Typography>
										<Typography variant="subtitle2">
											{settings?.activate_gateway
												? Number(settings?.reserve_price).toLocaleString() + " ریال"
												: "رایگان"}
										</Typography>
									</div>
								</div>
							</>
						)}
					</Grid>
					<Divider
						sx={{ width: "75%", display: "flex", marginLeft: "auto", marginRight: "auto" }}
					/>
					<div className={style.footer}>
						<Button
							disabled={!otpSended || !termsChecked}
							loading={loading}
							className={style.submitButton}
							size="xlarge"
							onClick={handleSubmit(onSubmit)}
						>
							ثبت و رزرو وقت
						</Button>
					</div>
				</Grid>
			</Paper>
			<MessageModal open={messageModalOpen} setOpen={setMessageModalOpen} data={messageModalData} />
		</div>
	);
};

export default HomePage;
