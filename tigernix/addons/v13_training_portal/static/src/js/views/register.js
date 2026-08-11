const { z } = Zod;

const baseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z
    .string()
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain number")
    .regex(/[!@#$%^&*]/, "Must contain special character")
    .min(8, "Password must be at least 8 characters")
    .min(1, "Password is required"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
});

const registerSchema = baseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    path: ["confirmPassword"],
    message: "Passwords must match",
  },
);

document.addEventListener("DOMContentLoaded", () => {
  const parent = document.getElementById("registerContainer")?.parentElement;

  parent?.style.setProperty("display", "flex", "important");
});

function getFormData() {
  return {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    confirmPassword: document.getElementById("confirmPassword").value,
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
  const field = e.target.name;
  const value = e.target.value;

  const schema = baseSchema.shape[field];
  const result = await schema.safeParse(value);

  if (!result.success) {
    setError(field, result.error.issues[0].message);
  } else {
    clearError(field);
  }

  if (field === "confirmPassword") {
    confirmPasswordValidate(e);
  }
};

const renderAlert = (msgText, alertType) => {
  const alertPlaceholder = document.getElementById("registerAlertPlaceholder");
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
  const alertPlaceholder = document.getElementById("registerAlertPlaceholder");
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

  const { confirmPassword, ...otherFormData } = getFormData();

  clearAlert();
  appendSpinner("registerSubmitBtn");
  const response = await fetch("/training_v13/register_new_user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(otherFormData),
  });

  const responseBody = await response.json();
  const { result: registerResult } = responseBody;

  if (registerResult?.error) {
    renderAlert(registerResult?.error?.message, "danger");
    removeSpinner("registerSubmitBtn", "Register");
    return;
  } else {
    removeSpinner("registerSubmitBtn", "Register");
    location.href = "/";
  }

  console.log("VALID ✅");
  console.log(getFormData());
};
