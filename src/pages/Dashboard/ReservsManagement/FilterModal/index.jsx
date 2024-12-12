import { Button } from "src/components/Button";
import { DatePicker } from "src/components/DatePicker";
import { Modal } from "src/components/Modal";
import style from "./style.module.scss";

const FilterModal = ({ open, setOpen, control, errors, onSubmit, reset }) => {
	return (
		<Modal
			fullWidth
			state={open}
			setState={() => setOpen()}
			maxWidth="md"
			footerEnd={
				<div className={style.buttons}>
					<Button size="xlarge" variant="ghost" onClick={() => setOpen()}>
						انصراف
					</Button>
					<Button size="xlarge" onClick={reset}>
						پاک کردن
					</Button>
					<Button size="xlarge" onClick={onSubmit}>
						تایید
					</Button>
				</div>
			}
		>
			<form className={style.form}>
				<DatePicker
					size="xlarge"
					label="از تاریخ"
					error={errors.date_after?.message}
					helperText="روز/ماه/سال"
					className={style.form__input}
					name="date_after"
					control={control}
				/>
				<DatePicker
					size="xlarge"
					label="تا تاریخ"
					error={errors.date_before?.message}
					helperText="روز/ماه/سال"
					className={style.form__input}
					name="date_before"
					control={control}
				/>
			</form>
		</Modal>
	);
};

export default FilterModal;
