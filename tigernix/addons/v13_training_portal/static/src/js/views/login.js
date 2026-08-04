const { z } = Zod;

const baseSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
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

function setValid(field) {
  const input = document.getElementById(field);

  if (input) {
    input.classList.remove("is-invalid");
  }
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

const renderAlert = (msgText, alertType) => {
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
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
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
    result.error.errors.forEach((err) => {
      setError(err.path[0], err.message);
    });

    return;
  }

  clearAlert();
  appendSpinner("loginSubmitBtn");
  const response = await fetch("/training_v13/login_user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(getFormData()),
  });

  const responseBody = await response.json();
  const { result: loginResult } = responseBody;

  if (loginResult?.error) {
    renderAlert(loginResult?.error?.message, "danger");
    removeSpinner("loginSubmitBtn", "Login");
    return;
  } else {
    removeSpinner("loginSubmitBtn", "Login");
    location.href = "/training/dashboard";
  }
};
