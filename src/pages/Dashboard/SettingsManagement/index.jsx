import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "src/components/Button";
import { Input } from "src/components/Input";
import { Switch } from "src/components/Switch";
import { handleError } from "src/utils/api-error-handling";
import axios from "src/utils/axios";
import notify from "src/utils/toast";
import { boolean, object, string } from "yup";
import style from "./style.module.scss";

const schema = () =>
	object({
		activate_gateway: boolean(),
		use_redis_cache: string(),
		gateway_token: string(),
		reserve_price: string(),
		terms_content: string(),
	});

const SettingsManagement = () => {
	const {
		register,
		setError,
		watch,
		setValue,
		handleSubmit,
		formState: { errors },
	} = useForm({
		mode: "onChange",
		resolver: yupResolver(schema()),
		defaultValues: { activate_gateway: false, use_redis_cache: "0" },
	});

	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState([]);

	const getData = () => {
		setLoading(true);
		axios
			.get("/admin/settings/list-create/")
			.then((res) => {
				setFormData(res?.data);
				res?.data?.map((item) => {
					let value = item?.value;
					if (item?.type === "activate_gateway") {
						value = value.toLowerCase() === "true" ? true : false;
					}
					setValue(item?.type, value);
				});
			})
			.catch((err) => {
				handleError({ err, setError });
			})
			.finally(() => setLoading(false));
	};
	const onSubmit = (data) => {
		for (const item in data) {
			setLoading(true);
			const result = formData.find((node) => node.type === item);
			if (!result) {
				if (data[item] !== "") {
					axios
						.post("/admin/settings/list-create/", {
							type: item,
							value: String(data[item]),
						})
						.then((res) => {})
						.catch((err) => {
							handleError({ err, setError });
						})
						.finally(() => setLoading(false));
				}
			} else {
				if (data[item] !== "") {
					axios
						.patch(`/admin/settings/update/?pk=${result?.id}`, {
							type: item,
							value: String(data[item]),
						})
						.then((res) => {})
						.catch((err) => {
							handleError({ err, setError });
						})
						.finally(() => setLoading(false));
				}
			}
		}
		notify("با موفقیت ثبت شد", "success");
	};

	useEffect(() => {
		getData();
	}, []);

	return (
		<>
			<div className={style.wrapper}>
				<div className={style.main}>
					<div className={`${style.history} ${"active"}`}>
						<div className={style.header}>
							<div className={style.header__title}>
								<div className={style.title}>تغییر رمز عبور</div>
							</div>
						</div>
						<form className={style.form}>
							<div className={`${style.form__input} ${style.form__inputSwitch}`}>
								وضعیت فعال بودن درگاه پرداخت زرین پال
								<Switch
									name="activate_gateway"
									checked={watch("activate_gateway")}
									onChange={(e) => setValue("activate_gateway", e.target.checked)}
								/>
							</div>
							<Input
								className={style.form__input}
								size="xlarge"
								label="توکن درگاه پرداخت زرین پال"
								error={errors.gateway_token?.message}
								{...register("gateway_token")}
							/>
							<Input
								className={style.form__input}
								size="xlarge"
								label="مبلغ پیش پرداخت برای رزرو"
								error={errors.reserve_price?.message}
								{...register("reserve_price")}
							/>
							<div className={`${style.form__input} ${style.form__inputSwitch}`}>
								وضعیت فعال بودن استفاده از ردیس
								<Switch
									name="use_redis_cache"
									checked={Boolean(Number(watch("use_redis_cache")))}
									onChange={(e) => setValue("use_redis_cache", e.target.checked ? "1" : "0")}
								/>
							</div>
							<Input
								className={style.form__inputFull}
								size="xlarge"
								label="متن شرایط و قوانین"
								type="textarea"
								error={errors.terms_content?.message}
								{...register("terms_content")}
							/>
						</form>
						<div className={style.buttons}>
							<Button size="xlarge" onClick={handleSubmit(onSubmit)} loading={loading}>
								تایید
							</Button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default SettingsManagement;
