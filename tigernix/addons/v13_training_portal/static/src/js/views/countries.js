// Development only — remove for production
agGrid.enableDevValidations();

const filterParamsDate = {
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

const columnDefsCountries = [
  {
    field: "name",
    headerName: "Country",
    minWidth: 220,
    valueGetter: (params) => `${params.data.emoji || ""} ${params.data.name}`,
  },
  {
    field: "iso2",
    headerName: "ISO2",
    maxWidth: 100,
  },
  {
    field: "iso3",
    headerName: "ISO3",
    maxWidth: 100,
  },
  {
    field: "capital",
    headerName: "Capital",
  },
  {
    field: "phonecode",
    headerName: "Phone Code",
    maxWidth: 130,
    valueFormatter: (params) => (params.value ? `+${params.value}` : "-"),
  },
  {
    field: "currency",
    headerName: "Currency",
    maxWidth: 120,
  },
  {
    field: "region",
    headerName: "Region",
  },
  {
    field: "subregion",
    headerName: "Sub Region",
  },
  {
    field: "timezones",
    headerName: "Timezone",
    minWidth: 220,
    valueGetter: (params) => {
      try {
        const tz = JSON.parse(params.data.timezones);
        return tz?.[0]?.zoneName || "-";
      } catch {
        return "-";
      }
    },
  },
];

let gridApiCountries;
let loadCountries;
let countriesData = [];

const gridOptionsCountries = {
  defaultColDef: {
    flex: 1,
    minWidth: 150,
    filter: true,
  },
  columnDefs: columnDefsCountries,
  pagination: true,
  alwaysShowVerticalScroll: true,
  alwaysShowHorizontalScroll: true,
};

// setup the grid after the page has finished loading
document.addEventListener("DOMContentLoaded", function () {
  const gridDiv = document.querySelector("#countriesTable");
  gridApiCountries = agGrid.createGrid(gridDiv, gridOptionsCountries);

  loadCountries = async (search = "") => {
    try {
      const url = new URL("/api/countries", "https://csc.sidsworld.co.in");

      if (search.trim()) {
        url.searchParams.set("q", search.trim());
      }

      const response = await fetch(url, {
        credentials: "same-origin",
        headers: {
          "X-CSCAPI-KEY":
            "SWJ1N3RtREdRYjEyOUZFTndLWWdDaVlhbVRDR1JDYWIzYkpRQ0lnQg==",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch countries");
      }

      const data = await response.json();
      countriesData = data?.countries || [];

      gridApiCountries.setGridOption("rowData", countriesData);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error(error);
      }
    }
  };

  loadCountries();
});

const debounce = (callback, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };
};

const searchCountries = debounce((e) => {
  const inputValue = e.target.value.toLowerCase();
  const filteredCountries = countriesData.filter(({ name, capital }) => {
    if (typeof name === "string") {
      return name.toLowerCase().substring(0, inputValue.length) === inputValue;
    }
  });
  gridApiCountries.setGridOption("rowData", filteredCountries);
}, 300);
