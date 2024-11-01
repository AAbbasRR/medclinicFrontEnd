import { yupResolver } from "@hookform/resolvers/yup";
import IconButton from "@mui/material/IconButton";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import IconEyeClose from "src/assets/icons/icon-eye-close.svg";
import IconEyeOpen from "src/assets/icons/icon-eye-open.svg";
import { Button } from "src/components/Button";
import { Input } from "src/components/Input";
import { Modal } from "src/components/Modal";
import { handleError } from "src/utils/api-error-handling";
import axios from "src/utils/axios";
import notify from "src/utils/toast";
import { translate } from "src/utils/translate";
import { object, string } from "yup";
import style from "./style.module.scss";

const schema = (isUpdate) =>
	object({
		first_name: string().required(translate.errors.required),
		last_name: string().required(translate.errors.required),
		email: string().required(translate.errors.required),
		password: isUpdate ? string() : string().required(translate.errors.required),
	});

const UsersModal = ({ open, setOpen, reload, setReload, setDefaultValue, defaultValue = null }) => {
	const {
		register,
		setError,
		setValue,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		mode: "onChange",
		resolver: yupResolver(schema(defaultValue !== null)),
		defaultValues: {},
	});

	const [loading, setLoading] = useState(false);
	const [editItemID, setEditItemID] = useState(null);
	const [showPassword, setShowPassword] = useState(false);

	const onSubmit = (data) => {
		setLoading(true);
		if (editItemID === null) {
			axios
				.post("/admin/user/staffs/list-create/", data)
				.then((res) => {
					closeModal();
					notify("با موفقیت ایجاد شد", "success");
					setReload(!reload);
				})
				.catch((err) => {
					handleError({ err, setError });
				})
				.finally(() => setLoading(false));
		} else {
			axios
				.patch(`/admin/user/staffs/update-delete/?pk=${editItemID}`, data)
				.then((res) => {
					closeModal();
					notify("با موفقیت ویرایش شد", "success");
					setReload(!reload);
				})
				.catch((err) => {
					handleError({ err, setError });
				})
				.finally(() => setLoading(false));
		}
	};
	const closeModal = () => {
		setDefaultValue(null);
		setEditItemID(null);
		reset();
		setOpen(false);
	};
	useEffect(() => {
		if (defaultValue !== null) {
			setEditItemID(defaultValue?.id);
			setValue("first_name", defaultValue?.first_name);
			setValue("last_name", defaultValue?.last_name);
			setValue("email", defaultValue?.email);
		}
	}, [defaultValue]);

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
					<Button size="xlarge" onClick={handleSubmit(onSubmit)} loading={loading}>
						تایید
					</Button>
				</div>
			}
		>
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
					size="xlarge"
					label="نام خانوادگی"
					required
					error={errors.last_name?.message}
					{...register("last_name")}
				/>
				<Input
					className={style.form__input}
					size="xlarge"
					label="ایمیل"
					required
					error={errors.email?.message}
					{...register("email")}
				/>
				<Input
					required={defaultValue === null}
					size="xlarge"
					label="رمز عبور"
					error={errors.password?.message}
					type={showPassword ? "text" : "password"}
					className={style.form__input}
					leftIcon={
						<IconButton onClick={() => setShowPassword((show) => !show)}>
							<img src={showPassword ? IconEyeClose : IconEyeOpen} alt="eye-icon" />
						</IconButton>
					}
					{...register("password")}
				/>
			</form>
		</Modal>
	);
};

export default UsersModal;
