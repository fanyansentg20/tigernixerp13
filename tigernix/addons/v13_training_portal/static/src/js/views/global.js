// static/src/js/global.js

let notyf;

window.addEventListener("load", () => {
  document.querySelectorAll('a[href="/web/login"]').forEach((el) => {
    el.href = "/training/login";
  });

  const changeEmailMenuList = Object.assign(document.createElement("a"), {
    href: "/training/change-email",
    className: "dropdown-item",
    textContent: "Change Email",
  });
  const changePasswordMenuList = Object.assign(document.createElement("a"), {
    href: "/training/change-password",
    className: "dropdown-item",
    textContent: "Change Password",
  });

  document
    .querySelector("#o_logout")
    ?.before(changeEmailMenuList, changePasswordMenuList);

  notyf = new Notyf({
    duration: 10000,
    position: {
      x: "right",
      y: "top",
    },
    types: [
      {
        type: "alert-info",
        className: "alert alert-info",
      },
      {
        type: "alert-error",
        className: "alert alert-danger",
      },
      {
        type: "alert-warning",
        className: "alert alert-warning",
      },
      {
        type: "alert-success",
        className: "alert alert-success",
      },
    ],
  });
});

const renderAlert = (msgText, alertType) => {
  notyf.open({
    type: alertType,
    message: msgText,
  });
};

const loadCountriesData = async () => {
  try {
    const url = new URL("/api/countries", "https://csc.sidsworld.co.in");
    const response = await fetch(url, {
      credentials: "same-origin",
      headers: {
        "X-CSCAPI-KEY":
          "SWJ1N3RtREdRYjEyOUZFTndLWWdDaVlhbVRDR1JDYWIzYkpRQ0lnQg==",
      },
    });

    if (!response.ok) {
      notyf.error("Failed to fetch countries");
      throw new Error("Failed to fetch countries");
    }

    const data = await response.json();
    return data?.countries;
  } catch (err) {
    console.error(err);
    return [];
  }
};

const loadStatesData = async (countryId) => {
  try {
    const url = new URL(
      `/api/states/${countryId}`,
      "https://csc.sidsworld.co.in",
    );
    const response = await fetch(url, {
      credentials: "same-origin",
      headers: {
        "X-CSCAPI-KEY":
          "SWJ1N3RtREdRYjEyOUZFTndLWWdDaVlhbVRDR1JDYWIzYkpRQ0lnQg==",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch states");
    }

    const data = await response.json();
    return data?.states;
  } catch (err) {
    console.error(err);
    return [];
  }
};

const loadCitiesData = async (stateId) => {
  try {
    const url = new URL(
      `/api/cities/${stateId}`,
      "https://csc.sidsworld.co.in",
    );
    const response = await fetch(url, {
      credentials: "same-origin",
      headers: {
        "X-CSCAPI-KEY":
          "SWJ1N3RtREdRYjEyOUZFTndLWWdDaVlhbVRDR1JDYWIzYkpRQ0lnQg==",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch cities");
    }

    const data = await response.json();
    return data?.cities;
  } catch (err) {
    console.error(err);
    return [];
  }
};

const checkOrAddNewState = (payload) => {
  fetch("/training/add_state", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

const togglePasswordVisibility = (inputId, iconId) => {
  const inputTypes = ["password", "text"];
  const iconClasses = ["bi bi-eye", "bi bi-eye-slash"];

  const passwordInput = document.getElementById(inputId);
  const icon = document.getElementById(iconId);

  passwordInput.type = inputTypes.find((type) => type !== passwordInput.type);
  icon.className = iconClasses.find((cls) => cls !== icon.className);
};

const validatePassRules = async ({
  elementId,
  fieldSchema,
  validationResult,
}) => {
  const passFieldContainer = document.getElementById(elementId);

  const allRulesElement = [...passFieldContainer.nextElementSibling.children];
  const allMsgFromElements = allRulesElement.map((el) =>
    el.innerText.replace("* ", "").trim(),
  );

  const allMsgFromSchema = fieldSchema._def.checks
    .map((check) => check.message)
    .splice(1, allMsgFromElements.length);

  const errorMsgFromResult = validationResult.error?.issues.map((issue) =>
    issue.message.toLowerCase().trim(),
  );

  // const currentElementMsgError = allRulesElement.find((el) =>
  //   el.innerText
  //     .replace("* ", "")
  //     .toLowerCase()
  //     .trim()
  //     .includes(validationResult.error?.issues[0].message.toLowerCase().trim()),
  // );

  const currentElementMsgError = allRulesElement.find((el) =>
    validationResult.error?.issues[0].message
      .toLowerCase()
      .trim()
      .includes(el.innerText.replace("* ", "").toLowerCase().trim()),
  );

  const currentSuccessElements = allRulesElement.filter(
    (el) =>
      !errorMsgFromResult?.some((issueMsg) =>
        issueMsg
          .toLowerCase()
          .trim()
          .includes(el.innerText.replace("* ", "").toLowerCase().trim()),
      ),
  );
  const currentDefaultElements = allRulesElement.filter(
    (el) =>
      !currentElementMsgError?.innerText
        .toLowerCase()
        .trim()
        .includes(el.innerText.replace("* ", "").toLowerCase().trim()) &&
      !currentSuccessElements?.some((successEl) =>
        successEl.innerText
          .toLowerCase()
          .trim()
          .includes(el.innerText.replace("* ", "").toLowerCase().trim()),
      ),
  );

  if (currentElementMsgError) {
    const renderErrorElement = () =>
      new Promise((resolve, reject) => {
        currentElementMsgError.className = "text-danger";

        const classNameUpdated =
          currentElementMsgError.className === "text-danger";

        if (classNameUpdated) {
          resolve();
        }
      });

    await renderErrorElement();
  }

  const renderSuccessElements = () =>
    new Promise((resolve, reject) => {
      currentSuccessElements?.forEach((el) => {
        el.className = "text-success";
      });

      const classNameUpdated = currentSuccessElements?.every(
        (el) => el.className === "text-success",
      );

      if (classNameUpdated) {
        resolve();
      }
    });

  await renderSuccessElements();

  const renderDefaultElements = () =>
    new Promise((resolve, reject) => {
      currentDefaultElements?.forEach((el) => {
        el.className = "text-desc";
      });

      const classNameUpdated = currentDefaultElements?.every(
        (el) => el.className === "text-desc",
      );

      if (classNameUpdated) {
        resolve();
      }
    });

  await renderDefaultElements();
};
const onClickTabMenu = (e) => {
  e.preventDefault();
  $(`.list-group a[href=\'#${e.target.name}\']`).tab("show");
  history.pushState({}, "", `/${e.target.name}`);
};
