import { Route, Routes } from "react-router-dom";
import { PrivateRoute } from "src/components/PrivateRoute";
import useAuthStore from "src/store";
import NotFound from "./404";
import ChangePassword from "./Dashboard/ChangePassword";
import DoctorManagement from "./Dashboard/DoctorManagement";
import ReservsManagement from "./Dashboard/ReservsManagement";
import SettingsManagement from "./Dashboard/SettingsManagement";
import UsersManagement from "./Dashboard/UsersManagement";
import Layout from "./Dashboard/components/Layout";
import HomePage from "./Home";
import SignIn from "./SignIn";

const dashboardPages = [
	{
		element: <UsersManagement />,
		path: "users-management",
	},
	{
		element: <DoctorManagement />,
		path: "doctor-management",
	},
	{
		element: <ReservsManagement />,
		path: "reservation-management",
	},
	{
		element: <SettingsManagement />,
		path: "settings-management",
	},
	{
		element: <ChangePassword />,
		path: "change-password",
	},
];

function Pages() {
	const { accessToken } = useAuthStore();

	return (
		<Routes>
			<Route path="/" element={<HomePage />} />
			<Route path="/signin" element={<SignIn />} />
			<Route path="/dashboard/*" element={<PrivateRoute isAuthenticated={accessToken} />}>
				<Route element={<Layout />}>
					{dashboardPages.map((page, i) => {
						return <Route key={i} path={page?.path} element={page?.element} />;
					})}
					<Route path="*" element={<NotFound />} />
				</Route>
			</Route>
			<Route path="*" element={<NotFound />} />
		</Routes>
	);
}

export default Pages;
