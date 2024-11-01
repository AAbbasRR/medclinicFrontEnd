import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "src/store";
import { Username } from "./components/Username";
import style from "./style.module.scss";

const SignIn = () => {
	const navigate = useNavigate();
	const { accessToken } = useAuthStore();

	useEffect(() => {
		if (accessToken) {
			navigate("/dashboard/reservation-management");
		}
	}, [accessToken]);

	return (
		<div className={style.wrapper}>
			<div className={style.main}>
				<div className={style.header}>
					<div className={style.title}>ورود به حساب مدیریت</div>
				</div>

				<Username />
			</div>
		</div>
	);
};

export default SignIn;
