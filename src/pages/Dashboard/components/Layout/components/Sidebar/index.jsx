import { useState } from "react";
import { NavLink } from "react-router-dom";
import IconDoctorManagement from "src/assets/icons/icon-doctor-management.svg";
import IconRemove from "src/assets/icons/icon-exit-24.svg";
import IconExit from "src/assets/icons/icon-exit.svg";
import IconLock from "src/assets/icons/icon-lock.svg";
import IconSetting from "src/assets/icons/icon-setting.svg";
import IconTime from "src/assets/icons/icon-time.svg";
import IconUsersManagement from "src/assets/icons/icon-users.svg";
import logo from "src/assets/images/logo.png";
import { Button } from "src/components/Button";
import { Modal } from "src/components/Modal";
import useAuthStore from "src/store";
import style from "./style.module.scss";

const menu = [
	{
		title: "مدیریت رزرو ها",
		icon: IconTime,
		path: "reservation-management",
	},
	{
		title: "مدیریت دکتران",
		icon: IconDoctorManagement,
		path: "doctor-management",
	},
	{
		title: "مدیریت کاربران",
		icon: IconUsersManagement,
		path: "users-management",
	},
	{
		title: "مدیریت تنظیمات",
		icon: IconSetting,
		path: "settings-management",
	},
	{
		title: "تغییر رمزعبور",
		icon: IconLock,
		path: "change-password",
	},
];

export const Sidebar = ({ sidebar, setSidebar }) => {
	const { logout } = useAuthStore();

	const [open, setOpen] = useState(false);

	const handleLogout = () => {
		setOpen(false);
		logout();
	};

	return (
		<>
			<aside className={`${style.wrapper} ${sidebar ? "active" : ""}`}>
				<img
					className={style.close}
					alt="remove-icon"
					src={IconRemove}
					onClick={() => setSidebar(false)}
				/>
				<div className={style.header}>
					<div className={style.logo}>
						<img src={logo} alt="logo" />
					</div>
				</div>

				<div className={style.main}>
					<nav className={style.nav}>
						{menu.map((link, i) => {
							return (
								<NavLink
									key={i}
									to={link.path}
									end
									className={style.nav__link}
									onClick={() => setSidebar(false)}
								>
									<img className={style.nav__linkIcon} src={link.icon} alt="icon" />
									<span className={style.nav__linkTitle}>{link.title}</span>
								</NavLink>
							);
						})}

						<div className={style.nav__separator_bottom} />

						<button className={style.nav__link} onClick={() => setOpen(true)}>
							<img className={style.nav__linkIcon} alt="logout-icon" src={IconExit} />
							<span className={style.nav__linkTitle}>خروج</span>
						</button>
					</nav>
				</div>
			</aside>

			<Modal
				fullWidth
				state={open}
				setState={setOpen}
				title="خروج"
				footerEnd={
					<div className={style.buttons}>
						<Button size="xlarge" variant="ghost" onClick={() => setOpen(false)}>
							انصراف
						</Button>
						<Button size="xlarge" onClick={handleLogout}>
							تایید
						</Button>
					</div>
				}
			>
				<div className={style.exit}>آیا مطمئن هستید که میخواهید خارج شوید؟</div>
			</Modal>
		</>
	);
};
