const { z: zod } = Zod;

document.addEventListener("DOMContentLoaded", () => {
  const parent = document.getElementById(
    "resetPasswordContainer",
  )?.parentElement;

  parent?.style.setProperty("display", "flex", "important");
});

const passSchema = zod.object({
  newPassword: zod
    .string()
    .min(1, "Password is required")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain number")
    .regex(/[!@#$%^&*]/, "Must contain special character")
    .min(6, "Password must be at least 6 characters")
    .min(1, "Password is required"),
  confirmPassword: zod.string().min(1, "Confirm password is required"),
});

const getAllFormData = () => {
  return {
    newPassword: document.getElementById("newPassword")?.value,
    confirmPassword: document.getElementById("confirmPassword")?.value,
  };
};

function setErrorPass(field, message) {
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

const appendSpinner = (elementId) => {
  const submitBtn = document.getElementById(elementId);
  submitBtn.disabled = true;
  submitBtn.innerHTML = "";
  submitBtn.innerHTML = `
    <div class="spinner-border spinner-border-sm" role="status"></div>
  `;
};

const removeSpinner = (elementId, originalText) => {
  const submitBtn = document.getElementById(elementId);
  submitBtn.disabled = false;
  submitBtn.innerHTML = originalText;
};

async function changePassword() {
  const result = passSchema.safeParse(getAllFormData());
  const captchaResponse = grecaptcha.getResponse();
  const params = Object.fromEntries(new URLSearchParams(location.search));

  if (!result.success) {
    result.error.errors.forEach((err) => {
      setErrorPass(err.path[0], err.message);
    });

    return;
  }

  if (!captchaResponse) {
    renderAlert("Please complete the reCAPTCHA", "alert-error");
    return;
  }

  appendSpinner("updatePasswordBtn");

  try {
    const res = await fetch("/training/reset_password", {
      method: "POST",
      body: JSON.stringify({ ...getAllFormData(), ...params }),
    });

    const data = await res.json();

    renderAlert(
      data.message || data.error.message,
      "alert-" + (data.error ? "error" : "success"),
    );

    removeSpinner("updatePasswordBtn", "Update Password");
    if (!data.error) {
      location.href = "./reset-password/success";
    }
  } catch (error) {
    renderAlert(error, "alert-error");
    removeSpinner("updatePasswordBtn", "Update Password");
  }
}

const confirmPassValidate = (e) => {
  const password = document.getElementById("newPassword").value;
  const confirmPassword = e.target.value;
  if (password !== confirmPassword) {
    setErrorPass("confirmPassword", "Passwords must match");
    return;
  }
  clearError("confirmPassword");
};

const onInputChange = (e) => {
  const field = e.target.id || e.target.name;
  const value = e.target.value;

  const schema = passSchema.shape[field];
  const result = schema.safeParse(value);

  if (field === "newPassword") {
    validatePassRules({
      elementId: `${field}Container`,
      fieldSchema: schema,
      validationResult: result,
    });
  }

  if (!result.success) {
    setErrorPass(field, result.error.issues[0].message);
  } else {
    clearError(field);
  }

  if (field === "confirmPassword") {
    confirmPassValidate(e);
  }
};
