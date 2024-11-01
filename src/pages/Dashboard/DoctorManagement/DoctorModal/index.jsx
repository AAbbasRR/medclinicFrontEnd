import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "src/components/Button";
import { Input } from "src/components/Input";
import { Modal } from "src/components/Modal";
import { handleError } from "src/utils/api-error-handling";
import axios from "src/utils/axios";
import notify from "src/utils/toast";
import { translate } from "src/utils/translate";
import { object, string } from "yup";
import style from "./style.module.scss";

const schema = () =>
	object({
		name: string().required(translate.errors.required),
		field: string().required(translate.errors.required),
		phone: string().required(translate.errors.required),
		national_code: string().required(translate.errors.required),
		address: string().required(translate.errors.required),
	});

const DoctorModal = ({
	open,
	setOpen,
	reload,
	setReload,
	setDefaultValue,
	defaultValue = null,
}) => {
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
		defaultValues: {
			discount_value: 0,
			discount_is_percent: false,
		},
	});

	const [loading, setLoading] = useState(false);
	const [editItemID, setEditItemID] = useState(null);

	const onSubmit = (data) => {
		setLoading(true);
		if (editItemID === null) {
			axios
				.post("/admin/doctor/list-create/", data)
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
				.patch(`/admin/doctor/update-delete/?pk=${editItemID}`, data)
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
		setOpen(false);
		reset();
		setDefaultValue(null);
	};

	useEffect(() => {
		if (defaultValue !== null) {
			setEditItemID(defaultValue?.id);
			setValue("name", defaultValue?.name);
			setValue("field", defaultValue?.field);
			setValue("phone", defaultValue?.phone);
			setValue("national_code", defaultValue?.national_code);
			setValue("address", defaultValue?.address);
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
					size="xlarge"
					label="نام دکتر"
					error={errors.name?.message}
					{...register("name")}
				/>
				<Input
					className={style.form__input}
					size="xlarge"
					label="تخصص"
					error={errors.field?.message}
					{...register("field")}
				/>
				<Input
					className={style.form__input}
					size="xlarge"
					label="شماره تماس"
					error={errors.phone?.message}
					{...register("phone")}
				/>
				<Input
					className={style.form__input}
					size="xlarge"
					label="کد ملی"
					error={errors.national_code?.message}
					{...register("national_code")}
				/>

				<Input
					className={style.form__inputFull}
					size="xlarge"
					type="textarea"
					label="آدرس"
					error={errors.address?.message}
					{...register("address")}
				/>
			</form>
		</Modal>
	);
};

export default DoctorModal;
