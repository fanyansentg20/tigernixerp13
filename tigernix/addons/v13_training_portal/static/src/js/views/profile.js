document.addEventListener("DOMContentLoaded", async function () {
  const titles = JSON.parse(document.getElementById("titles")?.dataset.titles);
  const user = JSON.parse(
    document.getElementById("userData")?.dataset.userData,
  );
  console.log("userData", user);

  flatpickr("#birthdate", {
    altInput: true,
    altFormat: "d F Y",
    dateFormat: "Y-m-d",
    onChange: (_, dateStr) =>
      onInputChange({
        target: {
          name: "birthdate",
          value: dateStr,
        },
      }),
  });

  let selectedCountry = null;
  let selectedCountryId = null;
  let selectedStateId = null;
  let currentStates = [];

  // ====================
  // INIT TOMSELECT
  // ====================

  const tsTitleReg = new TomSelect("#titleRegSelectTarget", {
    create: false,
    allowEmptyOption: true,
    placeholder: "Select Title...",
  });

  tsTitleReg.wrapper.id = "titleRegSelect";

  const tsCountryReg = new TomSelect("#countrySelectTarget", {
    create: false,
    maxOptions: 250,
    allowEmptyOption: true,
    placeholder: "Select Country...",
    sortField: [
      {
        field: "pinned",
        direction: "desc",
      },
      {
        field: "text",
        direction: "asc",
      },
    ],
  });

  tsCountryReg.wrapper.id = "countrySelect";

  const tsStateReg = new TomSelect("#stateSelectTarget", {
    create: false,
    allowEmptyOption: true,
    placeholder: "Select State...",
  });

  tsStateReg.wrapper.id = "stateSelect";

  const tsCityReg = new TomSelect("#citySelectTarget", {
    create: false,
    allowEmptyOption: true,
    placeholder: "Select City...",
  });

  tsCityReg.wrapper.id = "citySelect";

  tsCountryReg.clear();
  tsStateReg.clear();
  tsCityReg.clear();

  const loadStateOptions = async (countryId) => {
    currentStates = await loadStatesData(countryId);

    tsStateReg.addOptions(
      currentStates.map((state) => ({
        value: state.iso2,
        text: state.name,
      })),
    );

    tsStateReg.refreshOptions(false);
  };

  const loadCityOptions = async (stateId) => {
    const cities = await loadCitiesData(stateId);

    tsCityReg.addOptions(
      cities.map((city) => ({
        value: city.name,
        text: city.name,
      })),
    );

    tsCityReg.refreshOptions(false);
  };

  // ====================
  // LOAD TITLES
  // ====================

  tsTitleReg.addOptions(
    titles.map((title) => ({
      value: title.id,
      text: title.name,
    })),
  );

  // ====================
  // LOAD COUNTRIES
  // ====================

  const countries = await loadCountriesData();

  tsCountryReg.addOptions(
    countries.map((country) => ({
      value: country.iso2,
      text: `${country.emoji} ${country.name}`,
      pinned: country.iso2 === "SG",
    })),
  );

  tsCountryReg.refreshOptions(false);

  // ====================
  // TITLE CHANGE
  // ====================

  tsTitleReg.on("change", (value) => {
    onInputChange({
      target: {
        name: "titleRegSelect",
        value,
      },
    });
  });

  // ====================
  // COUNTRY CHANGE
  // ====================

  tsCountryReg.on("change", async (value) => {
    onInputChange({
      target: {
        name: "countrySelect",
        value,
      },
    });

    selectedCountryId =
      countries.find((country) => country.iso2 === value)?.id ?? null;

    // reset state
    tsStateReg.clear();
    tsStateReg.clearOptions();

    // reset city
    tsCityReg.clear();
    tsCityReg.clearOptions();

    if (!selectedCountryId) return;

    const mobileCodeElement = document.getElementById("mobileCode");
    if (mobileCodeElement) {
      const selectedCountry = countries.find(
        (country) => country.id === selectedCountryId,
      );
      const phonecode = selectedCountry.phonecode;
      const plusSign = phonecode.startsWith("+") ? "" : "+";

      mobileCodeElement.textContent = `${selectedCountry.emoji} ${plusSign}${selectedCountry.phonecode}`;
    }

    await loadStateOptions(selectedCountryId);
  });

  // ====================
  // STATE CHANGE
  // ====================

  tsStateReg.on("change", async (value) => {
    onInputChange({
      target: {
        name: "stateSelect",
        value,
      },
    });

    selectedStateId =
      currentStates.find((state) => state.iso2 === value)?.id ?? null;

    tsCityReg.clear();
    tsCityReg.clearOptions();

    if (!selectedCountryId || !selectedStateId) return;

    await loadCityOptions(selectedStateId);

    checkOrAddNewState({
      iso2: value,
      name: currentStates.find((state) => state.iso2 === value)?.name,
      countryIso2: selectedCountry?.iso2,
    });
  });

  // ====================
  // CITY CHANGE
  // ====================

  tsCityReg.on("change", (value) => {
    onInputChange({
      target: {
        name: "citySelect",
        value,
      },
    });
  });

  async function loadProfile() {
    try {
      selectedCountry = countries.find(
        (country) => country.iso2 === user.country,
      );

      document.getElementById("name").value = user.name || "";
      document.getElementById("mobile").value = user.mobile || "";
      tsTitleReg.setValue(user.title || "", true);
      document.getElementById("birthdate")._flatpickr.setDate(user.birthdate);
      tsCountryReg.setValue(user.country || "", true);
      selectedCountryId = selectedCountry?.id ?? null;
      await loadStateOptions(selectedCountryId);

      tsStateReg.setValue(user.state || "", true);
      selectedStateId =
        currentStates.find((state) => state.iso2 === user.state)?.id ?? null;
      await loadCityOptions(selectedStateId);

      tsCityReg.setValue(user.city || "", true);

      const mobileCodeElement = document.getElementById("mobileCode");
      if (mobileCodeElement && selectedCountry) {
        const plusSign = selectedCountry.phonecode.startsWith("+") ? "" : "+";
        mobileCodeElement.textContent = `${selectedCountry.emoji} ${plusSign}${selectedCountry.phonecode}`;
      }
    } catch (err) {
      console.error(err);
      renderAlert("Failed to load profile", "alert-error");
    }
  }
  loadProfile();
});

const { z } = Zod;

const baseSchema = z.object({
  titleRegSelect: z.string().min(1, "Title is required"),
  name: z.string().min(1, "Name is required"),
  birthdate: z.string().min(1, "Birthdate is required"),
  countrySelect: z.string().min(1, "Country is required"),
  stateSelect: z.string().optional(),
  citySelect: z.string().optional(),
  mobile: z.string().min(1, "Mobile is required"),
  profileOtp: z.string().min(1, "OTP is required"),
});

function setError(field, message) {
  const input =
    document.getElementById(field) || document.getElementsByName(field)?.[0];
  const error = document.getElementById(`${field}-err`);

  input.classList.add("is-invalid");

  error.textContent = message;
}

function clearError(field) {
  const input = document.getElementById(field);
  const error = document.getElementById(`${field}-err`);

  input.classList.remove("is-invalid");

  error.textContent = "";
}

const appendSpinner = (elementId) => {
  const submitBtn = document.getElementById(elementId);
  submitBtn.disabled = true;
  submitBtn.innerHTML = "";
  submitBtn.innerHTML = `
    <div class="spinner-border" role="status"></div>
  `;
};

const removeSpinner = (elementId, originalText) => {
  const submitBtn = document.getElementById(elementId);
  submitBtn.disabled = false;
  submitBtn.innerHTML = originalText;
};

const onInputChange = async (e) => {
  const field = e.target.name;
  const value = e.target.value;

  const schema = baseSchema.shape[field];
  const result = await schema.safeParse(value);

  if (!result.success) {
    setError(field, result.error.issues[0].message);
  } else {
    clearError(field);
  }
};

const getAllFormData = () => {
  return {
    title: document.getElementById("titleRegSelectTarget")?.value,
    name: document.getElementById("name")?.value,
    birthdate: document.getElementById("birthdate")?.value,
    country: document.getElementById("countrySelectTarget")?.value,
    state: document.getElementById("stateSelectTarget")?.value,
    city: document.getElementById("citySelectTarget")?.value,
    mobile: document.getElementById("mobile")?.value,
  };
};

async function updateProfile() {
  const profileData = getAllFormData();
  const { country, state, city, title, ...otherProfileData } = profileData;

  const schema = baseSchema.pick({
    titleRegSelect: true,
    name: true,
    mobile: true,
    birthdate: true,
    countrySelect: true,
    stateSelect: true,
    citySelect: true,
  });

  const result = schema.safeParse({
    ...otherProfileData,
    titleRegSelect: title,
    countrySelect: country,
    stateSelect: state,
    citySelect: city,
  });

  if (!result.success) {
    result.error.errors.forEach((err) => {
      setError(err.path[0], err.message);
    });

    return;
  }

  const captchaResponse = grecaptcha.getResponse();

  if (!captchaResponse) {
    renderAlert("Please complete the reCAPTCHA", "alert-error");
    return;
  }

  appendSpinner("saveProfileBtn");

  try {
    const res = await fetch("/training/update_profile", {
      method: "POST",
      body: JSON.stringify(profileData),
    });

    removeSpinner("saveProfileBtn", "Save Profile");
    renderAlert("Profile updated successfully.", "alert-info");
  } catch (error) {
    removeSpinner("saveProfileBtn", "Save Profile");
    renderAlert(error?.message || "Failed to update profile", "alert-error");
  }
}
