const { z } = Zod;

const baseSchema = z.object({
  titleRegSelect: z.string().min(1, "Title is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z
    .string()
    .min(1, "Password is required")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain number")
    .regex(/[!@#$%^&*]/, "Must contain special character")
    .min(6, "Password must be at least 6 characters")
    .min(1, "Password is required"),
  mobile: z.string().min(1, "Mobile is required"),
  birthdate: z.string().min(1, "Birthdate is required"),
  countryRegSelect: z.string().min(1, "Country is required"),
  stateRegSelect: z.string().min(1, "State is required"),
  cityRegSelect: z.string().min(1, "City is required"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
});

const registerSchema = baseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    path: ["confirmPassword"],
    message: "Passwords must match",
  },
);

document.addEventListener("DOMContentLoaded", async () => {
  const parent = document.getElementById("registerContainer")?.parentElement;

  parent?.style.setProperty("display", "flex", "important");

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

  const titles = JSON.parse(document.getElementById("titles")?.dataset.titles);

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

  const tsCountryReg = new TomSelect("#countryRegSelectTarget", {
    create: false,
    allowEmptyOption: true,
    maxOptions: 250,
    placeholder: "Select Country...",
    sortField: [
      {
        field: "pinned",
        direction: "desc",
      },
      {
        field: "name",
        direction: "asc",
      },
    ],
  });

  tsCountryReg.wrapper.id = "countryRegSelect";

  const tsStateReg = new TomSelect("#stateRegSelectTarget", {
    create: false,
    allowEmptyOption: true,
    placeholder: "Select State...",
  });

  tsStateReg.wrapper.id = "stateRegSelect";

  const tsCityReg = new TomSelect("#cityRegSelectTarget", {
    create: false,
    allowEmptyOption: true,
    placeholder: "Select City...",
  });

  tsCityReg.wrapper.id = "cityRegSelect";

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
      name: country.name,
      text: `${country.emoji} ${country.name}`,
      pinned: country.iso2 === "SG",
    })),
  );

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
        name: "countryRegSelect",
        value,
      },
    });

    selectedCountry = countries.find((country) => country.iso2 === value);

    selectedCountryId = selectedCountry?.id ?? null;

    const mobileLabel = document.getElementById("mobileLabel");
    const plusSign = selectedCountry?.phonecode?.startsWith("+") ? "" : "+";

    const mobileInputGroup = `
      <div id="mobileInputGroup" class="input-group mb-3">
        <div class="input-group-prepend">
          <span class="input-group-text" id="mobileCode">${selectedCountry?.emoji} ${plusSign}${selectedCountry?.phonecode}</span>
        </div>
        <input type="text" class="form-control" id="mobile" aria-describedby="basic-addon3">
        <div id="mobile-err" class="invalid-feedback"></div>
      </div>
    `;
    const disabledMobileInput = `<input type="text" class="form-control" id="mobile" aria-describedby="basic-addon3" disabled="true" />`;

    mobileLabel.nextElementSibling?.remove();
    mobileLabel.insertAdjacentHTML(
      "afterend",
      value ? mobileInputGroup : disabledMobileInput,
    );

    // reset state
    tsStateReg.clear();
    tsStateReg.clearOptions();

    // reset city
    tsCityReg.clear();
    tsCityReg.clearOptions();

    if (!selectedCountryId) return;

    currentStates = await loadStatesData(selectedCountryId);

    tsStateReg.addOptions(
      currentStates.map((state) => ({
        value: state.iso2,
        text: state.name,
      })),
    );

    tsStateReg.refreshOptions(false);
  });

  // ====================
  // STATE CHANGE
  // ====================

  tsStateReg.on("change", async (value) => {
    onInputChange({
      target: {
        name: "stateRegSelect",
        value,
      },
    });

    const selectedState = currentStates.find((state) => state.iso2 === value);

    selectedStateId = selectedState?.id ?? null;

    tsCityReg.clear();
    tsCityReg.clearOptions();

    if (!selectedCountryId || !selectedStateId) return;

    const cities = await loadCitiesData(selectedStateId);

    tsCityReg.addOptions(
      cities.map((city) => ({
        value: city.name,
        text: city.name,
      })),
    );

    tsCityReg.refreshOptions(false);

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
        name: "cityRegSelect",
        value,
      },
    });
  });
});

function getFormData() {
  return {
    titleRegSelect: document.getElementById("titleRegSelectTarget")?.value,
    name: document.getElementById("name")?.value,
    email: document.getElementById("email")?.value,
    password: document.getElementById("password")?.value,
    mobile: document.getElementById("mobile")?.value,
    birthdate: document.getElementById("birthdate")?.value,
    countryRegSelect: document.getElementById("countryRegSelectTarget")?.value,
    stateRegSelect: document.getElementById("stateRegSelectTarget")?.value,
    cityRegSelect: document.getElementById("cityRegSelectTarget")?.value,
    confirmPassword: document.getElementById("confirmPassword")?.value,
  };
}

function clearErrors() {
  document.querySelectorAll(".form-control").forEach((input) => {
    input.classList.remove("is-invalid");
  });

  document.querySelectorAll(".invalid-feedback").forEach((el) => {
    el.textContent = "";
  });
}

function setError(field, message) {
  const input = document.getElementById(field);
  const error = document.getElementById(`${field}-err`);
  const errorPrevElementClasses = error?.previousElementSibling?.classList;

  const isErrorExist = [...(errorPrevElementClasses || [])].includes(
    "is-invalid",
  );
  !isErrorExist && errorPrevElementClasses?.add("is-invalid");

  if (error) {
    error.textContent = message;
  }
}

function clearError(field) {
  const input = document.getElementById(field);
  const error = document.getElementById(`${field}-err`);
  const errorPrevElementClasses = error?.previousElementSibling?.classList;
  const isErrorExist = [...(errorPrevElementClasses || [])].includes(
    "is-invalid",
  );

  input?.classList.remove("is-invalid");
  isErrorExist && error?.previousElementSibling?.classList.remove("is-invalid");

  if (error) {
    error.textContent = "";
  }
}

const confirmPasswordValidate = (e) => {
  const password = document.getElementById("password").value;
  const confirmPassword = e.target.value;
  if (password !== confirmPassword) {
    setError("confirmPassword", "Passwords must match");
    return;
  }
  clearError("confirmPassword");
};

const onInputChange = async (e) => {
  const field = e.target.id || e.target.name;
  const value = e.target.value;

  const schema = baseSchema.shape[field];
  const result = await schema.safeParse(value);

  if (field === "password") {
    validatePassRules({
      elementId: `${field}Container`,
      fieldSchema: schema,
      validationResult: result,
    });
  }

  if (!result.success) {
    setError(field, result.error?.issues[0].message);
  } else {
    clearError(field);
  }

  if (field === "confirmPassword") {
    confirmPasswordValidate(e);
  }
};

const clearAlert = () => {
  const alertPlaceholder = document.getElementById("registerAlertPlaceholder");
  alertPlaceholder.innerHTML = "";
};

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

const onSubmit = async (e) => {
  e.preventDefault();

  clearErrors();

  const result = baseSchema.safeParse(getFormData());

  if (!result.success) {
    result.error?.errors.forEach((err) => {
      setError(err.path[0], err.message);
    });

    return;
  }

  const captchaResponse = grecaptcha.getResponse();

  if (!captchaResponse) {
    renderAlert("Please complete the reCAPTCHA", "alert-error");
    return;
  }

  const {
    confirmPassword,
    titleRegSelect,
    countryRegSelect,
    stateRegSelect,
    cityRegSelect,
    birthdate,
    ...otherFormData
  } = getFormData();

  clearAlert();
  appendSpinner("registerSubmitBtn");
  const response = await fetch("/training_v13/register_new_user", {
    method: "POST",
    body: JSON.stringify({
      ...otherFormData,
      title: titleRegSelect,
      date: birthdate,
      country: countryRegSelect,
      state: stateRegSelect,
      city: cityRegSelect,
    }),
  });

  const responseBody = await response.json();
  const { result: registerResult, error } = responseBody;

  if (registerResult?.error || error) {
    renderAlert(
      registerResult?.error?.message || error?.message,
      "alert-error",
    );
    removeSpinner("registerSubmitBtn", "Register");
    return;
  } else {
    removeSpinner("registerSubmitBtn", "Register");
    location.href = "./register/success";
    renderAlert("Registration successful", "alert-success");
  }
};
