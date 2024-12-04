import failGif from "src/assets/images/fail.gif";
import successGif from "src/assets/images/success.gif";
import { Button } from "src/components/Button";
import { Modal } from "src/components/Modal";
import style from "./style.module.scss";

const MessageModal = ({ open, setOpen, data }) => {
	return (
		<Modal
			fullWidth
			state={open}
			setState={() => setOpen(false)}
			maxWidth="xs"
			footerEnd={
				<div className={style.buttons}>
					<Button size="xlarge" onClick={() => setOpen(false)}>
						بستن
					</Button>
				</div>
			}
		>
			<div className={style.messageBox}>
				<img src={data?.success ? successGif : failGif} alt="status-icon" />
				<span className={data?.success ? style.success : style.fail}>{data?.message}</span>
			</div>
		</Modal>
	);
};

export default MessageModal;
