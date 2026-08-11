// Development only — remove for production
agGrid.enableDevValidations();

const filterParams = {
  maxNumConditions: 1,
  comparator: (filterLocalDateAtMidnight, cellValue) => {
    const dateAsString = cellValue;
    if (dateAsString == null) return -1;
    const dateParts = dateAsString.split("/");
    const cellDate = new Date(
      Number(dateParts[2]),
      Number(dateParts[1]) - 1,
      Number(dateParts[0]),
    );

    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
      return 0;
    }

    if (cellDate < filterLocalDateAtMidnight) {
      return -1;
    }

    if (cellDate > filterLocalDateAtMidnight) {
      return 1;
    }
    return 0;
  },
};

const columnDefs = [
  {
    field: "name",
    headerName: "Name",
  },
  {
    field: "email",
    headerName: "Email",
  },
  {
    field: "phone",
    headerName: "Phone",
  },
  {
    field: "mobile",
    headerName: "Mobile",
  },
  {
    field: "company",
    headerName: "Company",
  },
  {
    field: "city",
    headerName: "City",
  },
  {
    field: "country",
    headerName: "Country",
  },
  {
    field: "last_login",
    headerName: "Last Login",
    filter: "agDateColumnFilter",
    filterParams: filterParams,
    valueFormatter: (params) =>
      params.value ? new Date(params.value).toLocaleString() : "-",
  },
  {
    field: "create_date",
    headerName: "Created Date",
    filter: "agDateColumnFilter",
    filterParams: filterParams,
    valueFormatter: (params) =>
      params.value ? new Date(params.value).toLocaleDateString() : "-",
  },
  {
    field: "active",
    headerName: "Status",
    maxWidth: 120,
    valueFormatter: (params) => (params.value ? "Active" : "Inactive"),
  },
];

let gridApi;
let loadUsers;

const gridOptions = {
  defaultColDef: {
    flex: 1,
    minWidth: 150,
    filter: true,
  },
  columnDefs,
  pagination: true,
  alwaysShowVerticalScroll: true,
  alwaysShowHorizontalScroll: true,
};

// setup the grid after the page has finished loading
document.addEventListener("DOMContentLoaded", function () {
  const gridDiv = document.querySelector("#usersTable");
  gridApi = agGrid.createGrid(gridDiv, gridOptions);

  loadUsers = async (search = "") => {
    try {
      const url = new URL("/training/list_users", window.location.origin);

      if (search.trim()) {
        url.searchParams.set("search", search.trim());
      }

      const response = await fetch(url, {
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();

      gridApi.setGridOption("rowData", data?.users || []);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error(error);
      }
    }
  };

  loadUsers();
});

const debounce = (callback, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };
};

const searchUsers = debounce((e) => {
  loadUsers && loadUsers(e.target.value);
}, 300);
