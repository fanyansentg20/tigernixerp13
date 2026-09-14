const { z } = Zod;

const baseSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

document.addEventListener("DOMContentLoaded", () => {
  const parent = document.getElementById("loginContainer")?.parentElement;

  parent?.style.setProperty("display", "flex", "important");
});

function getFormData() {
  return {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
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

  input.classList.add("is-invalid");

  error.textContent = message;
}

function clearError(field) {
  const input = document.getElementById(field);
  const error = document.getElementById(`${field}-err`);

  input.classList.remove("is-invalid");

  error.textContent = "";
}

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

const renderAlertPlaceholder = (msgText, alertType) => {
  const alertPlaceholder = document.getElementById("loginAlertPlaceholder");
  const appendAlert = (message, type) => {
    const wrapper = document.createElement("div");
    const alertElement = [
      `<div class="alert alert-${type} alert-dismissible" role="alert">`,
      `   <div>${message}</div>`,
      "</div>",
    ].join("");

    if (alertElement !== wrapper.innerHTML) {
      wrapper.innerHTML = alertElement;
      alertPlaceholder.append(wrapper);
    }
  };

  appendAlert(msgText, alertType);
};

const clearAlert = () => {
  const alertPlaceholder = document.getElementById("loginAlertPlaceholder");
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

const getRedirectUrl = () => {
  const redirectUrl = new URLSearchParams(location.search).get("redirect");

  if (redirectUrl) {
    return redirectUrl;
  }

  return "/";
};

const onSubmit = async (e) => {
  e.preventDefault();
  clearErrors();

  const result = baseSchema.safeParse(getFormData());

  if (!result.success) {
    result.error.errors.forEach((err) => {
      setError(err.path[0], err.message);
    });

    return;
  }

  const captchaResponse = grecaptcha.getResponse();

  if (!captchaResponse) {
    renderAlertPlaceholder("Please complete the reCAPTCHA", "danger");
    return;
  }

  clearAlert();
  appendSpinner("loginSubmitBtn");

  try {
    const response = await fetch("/training_v13/login_user", {
      method: "POST",
      body: JSON.stringify(getFormData()),
    });

    const responseBody = await response.json();
    const { result: loginResult, error } = responseBody;

    if (loginResult?.error || error) {
      renderAlertPlaceholder(
        loginResult?.error?.message || error?.message,
        "danger",
      );
      removeSpinner("loginSubmitBtn", "Login");
      return;
    } else {
      removeSpinner("loginSubmitBtn", "Login");
      location.href = getRedirectUrl();
    }
  } catch (error) {
    console.error(error);
  }
};
