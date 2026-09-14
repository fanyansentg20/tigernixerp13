const { z } = Zod;

const emailSchema = z.object({
  newEmail: z
    .string()
    .email("Invalid email address")
    .min(1, "New email is required"),
  emailOtp: z.string().min(1, "OTP code is required"),
});

document.addEventListener("DOMContentLoaded", () => {
  const parent = document.getElementById("changeEmailContainer")?.parentElement;

  parent?.style.setProperty("display", "flex", "important");
});

const getAllFormData = () => {
  return {
    newEmail: document.getElementById("newEmail")?.value,
    emailOtp: document.getElementById("emailOtp")?.value,
  };
};

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

async function sendEmailOtp() {
  const { newEmail } = getAllFormData();
  const schema = emailSchema.pick({ newEmail: true });
  const result = schema.safeParse({ newEmail });

  if (!result.success) {
    result.error.errors.forEach((err) => {
      setError("newEmail", err.message);
    });
    return;
  }

  appendSpinner("requestOtpBtn");

  try {
    await fetch("/training/send_email_otp", {
      method: "POST",
      body: JSON.stringify({
        new_email: document.getElementById("newEmail").value,
      }),
    });
    renderAlert("OTP sent to your new email", "alert-success");

    removeSpinner("requestOtpBtn", "Request OTP");
  } catch (error) {
    renderAlert(error, "alert-error");

    removeSpinner("requestOtpBtn", "Request OTP");
  }
}

async function changeEmail() {
  const result = emailSchema.safeParse(getAllFormData());

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

  appendSpinner("updateEmailBtn");

  try {
    const res = await fetch("/training/change_email", {
      method: "POST",
      body: JSON.stringify({
        otp_code: document.getElementById("emailOtp").value,
      }),
    });

    const data = await res.json();

    if (data.success) {
      renderAlert("Email updated to : " + data.data.email, "alert-success");
      location.href = "/";
    }
    removeSpinner("updateEmailBtn", "Update Email");
  } catch (error) {
    renderAlert(error, "alert-error");
    removeSpinner("updateEmailBtn", "Update Email");
  }
}

const onInputChange = (e) => {
  const field = e.target.name;
  const value = e.target.value;

  const schema = emailSchema.shape[field];
  const result = schema.safeParse(value);

  if (!result.success) {
    setError(field, result.error.issues[0].message);
  } else {
    clearError(field);
  }
};
