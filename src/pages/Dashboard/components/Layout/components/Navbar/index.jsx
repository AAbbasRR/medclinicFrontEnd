import { NavLink } from "react-router-dom";
import IconDoctorManagement from "src/assets/icons/icon-doctor-management.svg";
import IconSetting from "src/assets/icons/icon-setting.svg";
import IconTime from "src/assets/icons/icon-time.svg";
import IconUsersManagement from "src/assets/icons/icon-users.svg";
import style from "./style.module.scss";

const menu = [
	{
		title: "رزرو ها",
		icon: IconTime,
		path: "reservation-management",
	},
	{
		title: "دکتران",
		icon: IconDoctorManagement,
		path: "doctor-management",
	},
	{
		title: "کاربران",
		icon: IconUsersManagement,
		path: "users-management",
	},
	{
		title: "تنظیمات",
		icon: IconSetting,
		path: "settings-management",
	},
];

export const Navbar = () => {
	const claassName = ({ isActive }) => (isActive ? style.nav__link + " active" : style.nav__link);

	return (
		<div className={style.wrapper}>
			<div className={style.main}>
				<nav className={style.nav}>
					{menu.map((link, i) => {
						return (
							<NavLink key={i} to={link.path} end className={claassName}>
								<img className={style.nav__linkIcon} src={link.icon} alt="icon" />
								<span className={style.nav__linkTitle}>{link.title}</span>
							</NavLink>
						);
					})}
				</nav>
			</div>
		</div>
	);
};
