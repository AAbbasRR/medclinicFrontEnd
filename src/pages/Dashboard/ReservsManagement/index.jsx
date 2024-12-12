import { IconButton, Tooltip } from "@mui/material";
import _debounce from "lodash/debounce";
import moment from "moment-jalaali";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import IconExcel from "src/assets/icons/icon-excel-file.svg";
import IconSearch from "src/assets/icons/icon-input-search.svg";
import IconAdd from "src/assets/icons/icon-plus-circle-success.svg";
import { Button } from "src/components/Button";
import { Empty } from "src/components/Empty";
import { Input } from "src/components/Input";
import { Spin } from "src/components/Spin";
import { Table } from "src/components/Table";
import { handleError } from "src/utils/api-error-handling";
import axios from "src/utils/axios";
import AddReserveModal from "./AddReserveModal";
import FilterModal from "./FilterModal";
import style from "./style.module.scss";

const ReservsManagement = () => {
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		mode: "onChange",
	});

	const [data, setData] = useState([]);
	const [count, setCount] = useState(0);
	const [loading, setLoading] = useState(false);
	const [searchValue, setSearchValue] = useState("");
	const [paginationModel, setPaginationModel] = useState({ pageSize: 15, page: 1 });
	const [value, setValue] = useState("");
	const [filterModal, setFilterModal] = useState(false);
	const [filterData, setFilterData] = useState({
		created_at_after: "",
		created_at_before: "",
	});
	const [createReserveModal, setCreateReserveModal] = useState(false);
	const [reload, setReload] = useState(false);

	const debouncedSearch = useMemo(
		() =>
			_debounce((value) => {
				setSearchValue(value);
			}, 750),
		[searchValue],
	);

	const handleChange = (e) => {
		const value = e.target.value;
		setValue(value);
		debouncedSearch(value);
	};
	const getData = () => {
		setLoading(true);
		const { pageSize, page } = paginationModel;

		axios
			.get("/admin/reservations/list/", {
				params: {
					search: searchValue,
					page: page,
					page_size: pageSize,
					created_at_after: filterData?.created_at_after,
					created_at_before: filterData?.created_at_before,
				},
			})
			.then((res) => {
				setData(res?.data?.results);
				setCount(res?.data?.total);
			})
			.catch((err) => {
				handleError({ err });
			})
			.finally(() => setLoading(false));
	};
	const ExportData = () => {
		setLoading(true);

		axios
			.get("/admin/reservations/list/export/", {
				params: {
					search: searchValue,
					created_at_after: filterData?.created_at_after,
					created_at_before: filterData?.created_at_before,
				},
				responseType: "blob",
			})
			.then((res) => {
				const url = window.URL.createObjectURL(new Blob([res?.data]));
				const link = document.createElement("a");
				link.href = url;
				link.setAttribute("download", "export_factors.xlsx");
				document.body.appendChild(link);
				link.click();
			})
			.catch((err) => {
				handleError({ err });
			})
			.finally(() => setLoading(false));
	};
	const getSubmitFilter = (data) => {
		try {
			let after_date = new Date(data?.created_at_after);
			after_date.setDate(after_date.getDate() + 1);
			data.created_at_after = after_date.toISOString()?.slice(0, 10);
		} catch {}

		try {
			let before_date = new Date(data?.created_at_before);
			before_date.setDate(before_date.getDate() + 1);
			data.created_at_before = before_date.toISOString()?.slice(0, 10);
		} catch {}

		setFilterData({ ...data });
		setFilterModal(false);
	};
	const resetFilter = () => {
		reset();
		setFilterData({
			created_at_after: "",
			created_at_before: "",
		});
		setFilterModal(false);
	};

	useEffect(() => {
		setPaginationModel((e) => ({ ...e, page: 1 }));
	}, [searchValue]);
	useEffect(() => {
		getData();
	}, [paginationModel, filterData, reload]);

	const columns = [
		{
			headerName: "نام و نام خانوادگی",
			field: "full_name",
			flex: 1,
			minWidth: 200,
			sortable: false,
		},
		{
			headerName: "دکتر",
			field: "doctor",
			flex: 1,
			minWidth: 100,
			sortable: false,
			renderCell: ({ row }) => `${row?.doctor?.field}: ${row?.doctor?.name}`,
		},
		{
			headerName: "شماره تماس",
			field: "mobile_number",
			flex: 1,
			minWidth: 120,
			sortable: false,
		},
		{
			headerName: "تاریخ",
			field: "date",
			flex: 1,
			minWidth: 150,
			sortable: false,
			renderCell: ({ row }) =>
				`${moment(row?.date, "jYYYY/jMM/jDD").format("dddd")} (${new Date(
					row?.date,
				).toLocaleDateString("fa-ir")})`,
		},
		{
			headerName: "زمان",
			field: "time",
			flex: 1,
			minWidth: 150,
			sortable: false,
		},
	];

	return (
		<>
			<div className={style.wrapper}>
				<div className={style.main}>
					<div className={`${style.history} ${"active"}`}>
						<div className={style.header}>
							<div className={style.header__title}>
								<div className={style.title}>رزرو ها</div>
								<Tooltip title="ثبت رزرو جدید">
									<IconButton
										className={style.IconButton}
										onClick={() => setCreateReserveModal(true)}
									>
										<img src={IconAdd} alt="add-icon" />
									</IconButton>
								</Tooltip>
							</div>
							<div className={style.row}>
								<Button variant="contained" onClick={() => setFilterModal(true)}>
									فیلتر
								</Button>
								<Input
									size="small"
									value={value}
									className={style.input}
									onChange={handleChange}
									placeholder="جستجو..."
									rightIcon={<img src={IconSearch} alt="search-icon" />}
								/>
								<Tooltip title="خروجی اکسل">
									<IconButton className={style.IconButton} onClick={ExportData}>
										<img src={IconExcel} className={style.searchListIcon} alt="export-icon" />
									</IconButton>
								</Tooltip>
							</div>
						</div>
						{data?.length > 0 ? (
							<div className={style.table}>
								<Table
									rows={data}
									loading={loading}
									columns={columns}
									paginationCount={count}
									pagination={paginationModel}
									paginationChange={setPaginationModel}
								/>
							</div>
						) : loading ? (
							<Spin size={50} />
						) : (
							<Empty />
						)}
					</div>
				</div>
			</div>
			<FilterModal
				open={filterModal}
				setOpen={setFilterModal}
				control={control}
				errors={errors}
				onSubmit={handleSubmit(getSubmitFilter)}
				reset={resetFilter}
			/>
			<AddReserveModal
				open={createReserveModal}
				setOpen={setCreateReserveModal}
				reload={reload}
				setReload={setReload}
			/>
		</>
	);
};

export default ReservsManagement;
