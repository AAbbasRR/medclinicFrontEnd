import _debounce from "lodash/debounce";
import { useEffect, useMemo, useState } from "react";
import IconSearch from "src/assets/icons/icon-input-search.svg";
import { Empty } from "src/components/Empty";
import { Input } from "src/components/Input";
import { Spin } from "src/components/Spin";
import { Table } from "src/components/Table";
import { handleError } from "src/utils/api-error-handling";
import axios from "src/utils/axios";
import style from "./style.module.scss";

const ReservsManagement = () => {
	const [data, setData] = useState([]);
	const [count, setCount] = useState(0);
	const [loading, setLoading] = useState(false);
	const [searchValue, setSearchValue] = useState("");
	const [paginationModel, setPaginationModel] = useState({ pageSize: 15, page: 1 });
	const [value, setValue] = useState("");

	console.log(data);

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

	useEffect(() => {
		setPaginationModel((e) => ({ ...e, page: 1 }));
	}, [searchValue]);
	useEffect(() => {
		getData();
	}, [paginationModel]);

	const columns = [
		{
			headerName: "نام",
			field: "first_name",
			flex: 1,
			minWidth: 150,
			sortable: false,
		},
		{
			headerName: "نام خانوادگی",
			field: "last_name",
			flex: 1,
			minWidth: 150,
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
			headerName: "کد ملی",
			field: "national_code",
			flex: 1,
			minWidth: 150,
			sortable: false,
		},
		{
			headerName: "تاریخ",
			field: "date",
			flex: 1,
			minWidth: 150,
			sortable: false,
			renderCell: ({ row }) => `${row?.day_of_week} ${row?.date} ${row?.month} ماه ${row?.year}`,
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
							</div>
							<div className={style.row}>
								<Input
									size="small"
									value={value}
									className={style.input}
									onChange={handleChange}
									placeholder="جستجو..."
									rightIcon={<img src={IconSearch} alt="search-icon" />}
								/>
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
		</>
	);
};

export default ReservsManagement;
