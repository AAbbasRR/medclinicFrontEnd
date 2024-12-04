import { IconButton, Tooltip } from "@mui/material";
import _debounce from "lodash/debounce";
import { useEffect, useMemo, useState } from "react";
import IconDelete from "src/assets/icons/icon-delete.svg";
import iconDetail from "src/assets/icons/icon-detail.svg";
import IconEdit from "src/assets/icons/icon-edit.svg";
import IconSearch from "src/assets/icons/icon-input-search.svg";
import IconAdd from "src/assets/icons/icon-plus-circle-success.svg";
import { Button } from "src/components/Button";
import { Empty } from "src/components/Empty";
import { Input } from "src/components/Input";
import { Modal } from "src/components/Modal";
import { Spin } from "src/components/Spin";
import { Table } from "src/components/Table";
import { handleError } from "src/utils/api-error-handling";
import axios from "src/utils/axios";
import DateTimesModal from "./DateTimesModal";
import DoctorModal from "./DoctorModal";
import style from "./style.module.scss";

const DoctorManagement = () => {
	const [data, setData] = useState([]);
	const [count, setCount] = useState(0);
	const [loading, setLoading] = useState(false);
	const [searchValue, setSearchValue] = useState("");
	const [paginationModel, setPaginationModel] = useState({ pageSize: 15, page: 1 });
	const [value, setValue] = useState("");
	const [adminModalOpen, setAdminModalOpen] = useState(false);
	const [editAdminData, setEditAdminData] = useState(null);
	const [dateTimeModalOpen, setDateTimeModalOpen] = useState(false);
	const [selectedDoctorDateTime, setSelectedDoctorDateTime] = useState(null);
	const [reload, setReload] = useState(false);
	const [deleteDoctorModalOpen, setDeleteDoctorModalOpen] = useState(false);
	const [selectedDoctorForDelete, setSelectedDoctorForDelete] = useState(null);

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
			.get("/admin/doctor/list-create/", {
				params: {
					search: searchValue,
					page: page,
					page_size: pageSize,
				},
			})
			.then((res) => {
				setData(res.data.results);
				setCount(res?.data?.total);
			})
			.catch((err) => {
				handleError({ err });
			})
			.finally(() => setLoading(false));
	};
	const deleteAdmin = (id) => {
		setLoading(true);
		axios
			.delete("/admin/doctor/update-delete/", {
				params: { pk: id },
			})
			.then((res) => {
				getData();
				setDeleteDoctorModalOpen(false);
				setSelectedDoctorForDelete(null);
			})
			.catch((err) => {
				handleError({ err });
			})
			.finally(() => setLoading(false));
	};
	const editAdmin = (item) => {
		setAdminModalOpen(true);
		setEditAdminData(item);
	};
	const openModalDateTime = (doctorId) => {
		setDateTimeModalOpen(true);
		setSelectedDoctorDateTime(doctorId);
	};

	useEffect(() => {
		setPaginationModel((e) => ({ ...e, page: 1 }));
	}, [searchValue]);
	useEffect(() => {
		getData();
	}, [reload, paginationModel]);

	const columns = [
		{
			headerName: "نام",
			field: "name",
			flex: 1,
			minWidth: 150,
			sortable: false,
		},
		{
			headerName: "تخصص",
			field: "field",
			flex: 1,
			minWidth: 100,
			sortable: false,
		},
		{
			headerName: "شماره تماس",
			field: "phone",
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
			headerName: "تاریخ ایجاد",
			field: "formatted_created_at",
			flex: 1,
			minWidth: 150,
			sortable: false,
			renderCell: ({ row }) => new Date(row?.formatted_created_at).toLocaleString("fa-IR"),
		},
		{
			headerName: "",
			field: "action",
			sortable: false,
			minWidth: 150,
			flex: 1,
			renderCell: ({ row }) => (
				<div className={style.row}>
					<Tooltip title="تاریخ و ساعت ویزیت">
						<IconButton className={style.IconButton} onClick={() => openModalDateTime(row?.id)}>
							<img src={iconDetail} alt="detail-icon" />
						</IconButton>
					</Tooltip>
					<Tooltip title="ویرایش">
						<IconButton className={style.IconButton} onClick={() => editAdmin(row)}>
							<img src={IconEdit} alt="delete-icon" />
						</IconButton>
					</Tooltip>
					<Tooltip title="حذف">
						<IconButton
							className={style.IconButton}
							onClick={() => {
								setSelectedDoctorForDelete(row);
								setDeleteDoctorModalOpen(true);
							}}
						>
							<img src={IconDelete} alt="delete-icon" />
						</IconButton>
					</Tooltip>
				</div>
			),
		},
	];

	return (
		<>
			<div className={style.wrapper}>
				<div className={style.main}>
					<div className={`${style.history} ${"active"}`}>
						<div className={style.header}>
							<div className={style.header__title}>
								<div className={style.title}>مدیریت دکتران</div>
								<Tooltip title="ثبت دکتر جدید">
									<IconButton className={style.IconButton} onClick={() => setAdminModalOpen(true)}>
										<img src={IconAdd} alt="add-icon" />
									</IconButton>
								</Tooltip>
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
			<DoctorModal
				open={adminModalOpen}
				setOpen={setAdminModalOpen}
				setDefaultValue={setEditAdminData}
				defaultValue={editAdminData}
				reload={reload}
				setReload={setReload}
			/>
			<DateTimesModal
				open={dateTimeModalOpen}
				setOpen={setDateTimeModalOpen}
				doctor={selectedDoctorDateTime}
				setDoctor={setSelectedDoctorDateTime}
			/>
			<Modal
				fullWidth
				state={deleteDoctorModalOpen}
				setState={setDeleteDoctorModalOpen}
				title="حذف دکتر"
				footerEnd={
					<div className={style.buttons}>
						<Button size="xlarge" variant="ghost" onClick={() => setDeleteDoctorModalOpen(false)}>
							انصراف
						</Button>
						<Button size="xlarge" onClick={() => deleteAdmin(selectedDoctorForDelete?.id)}>
							تایید
						</Button>
					</div>
				}
			>
				<div className={style.exit}>
					آیا مطمئن هستید که میخواهید دکتر "{selectedDoctorForDelete?.name}" را حذف کنید؟
				</div>
			</Modal>
		</>
	);
};

export default DoctorManagement;
