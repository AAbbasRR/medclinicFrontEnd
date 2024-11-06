import { createTheme } from "@mui/material";

const theme = createTheme({
	breakpoints: {
		values: {
			xs: 0,
			sm: 576,
			md: 768,
			lg: 1200,
			xl: 1536,
		},
	},
});

theme.typography.h5 = {
	fontSize: "22px",
	[theme.breakpoints.down("md")]: {
		fontSize: "20px",
	},
	[theme.breakpoints.down("sm")]: {
		fontSize: "18px",
	},
};
theme.typography.h6 = {
	fontSize: "20px",
	[theme.breakpoints.down("md")]: {
		fontSize: "18px",
	},
	[theme.breakpoints.down("sm")]: {
		fontSize: "16px",
	},
};
theme.typography.subtitle1 = {
	fontWeight: "100",
	fontSize: "16px",
	[theme.breakpoints.down("md")]: {
		fontSize: "14px",
	},
	[theme.breakpoints.down("sm")]: {
		fontSize: "12px",
	},
};

theme.typography.subtitle2 = {
	fontWeight: "100",
	fontSize: "14px",
	[theme.breakpoints.down("md")]: {
		fontSize: "14px",
	},
	[theme.breakpoints.down("sm")]: {
		fontSize: "12px",
	},
};
theme.typography.caption = {
	fontSize: "12px",
	[theme.breakpoints.down("md")]: {
		fontSize: "10px",
	},
	[theme.breakpoints.down("sm")]: {
		fontSize: "10px",
	},
};

export default theme;
