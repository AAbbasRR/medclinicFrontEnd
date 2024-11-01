import { yupResolver } from "@hookform/resolvers/yup";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import IconEyeClose from "src/assets/icons/icon-eye-close.svg";
import IconEyeOpen from "src/assets/icons/icon-eye-open.svg";
import { Button } from "src/components/Button";
import { Input } from "src/components/Input";
import useAuthStore from "src/store";
import { handleError } from "src/utils/api-error-handling";
import axios from "src/utils/axios";
import notify from "src/utils/toast";
import { translate } from "src/utils/translate";
import { object, string } from "yup";
import style from "./style.module.scss";

const schema = object({
	password: string().required(translate.errors.required),
	email: string().required(translate.errors.required),
});

export const Username = () => {
	const navigate = useNavigate();
	const { login } = useAuthStore();
	const {
		register,
		setError,
		handleSubmit,
		formState: { errors },
	} = useForm({ mode: "onChange", resolver: yupResolver(schema) });

	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const onSubmit = (data) => {
		setLoading(true);

		axios
			.post("/public/auth/login/", data)
			.then(async (res) => {
				await login({ ...res.data });
				notify(translate.notify.entranceSuccess, "success");
				navigate("/dashboard/reservation-management");
			})
			.catch((err) => {
				handleError({ err, setError });
			})
			.finally(() => {
				setLoading(false);
			});
	};

	return (
		<form className={style.wrapper} onSubmit={handleSubmit(onSubmit)}>
			<Input
				required
				size="xlarge"
				label="ایمیل"
				error={errors.email?.message}
				className={style.input}
				{...register("email")}
			/>
			<Input
				required
				size="xlarge"
				label="رمز عبور"
				error={errors.password?.message}
				type={showPassword ? "text" : "password"}
				className={style.input}
				leftIcon={
					<IconButton onClick={() => setShowPassword((show) => !show)}>
						<img src={showPassword ? IconEyeClose : IconEyeOpen} alt="eye-icon" />
					</IconButton>
				}
				{...register("password")}
			/>
			<Button className={style.button} size="xlarge" loading={loading} disabled={loading}>
				ورود
			</Button>
		</form>
	);
};
