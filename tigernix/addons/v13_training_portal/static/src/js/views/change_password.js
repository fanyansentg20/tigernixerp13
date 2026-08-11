document.addEventListener("DOMContentLoaded", () => {
  const parent = document.getElementById(
    "changePasswordContainer",
  )?.parentElement;

  parent?.style.setProperty("display", "flex", "important");
});

async function sendPasswordOtp() {
  await fetch("/training/send_password_otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: {},
    }),
  });

  alert("OTP sent.");
}

async function changePassword() {
  const res = await fetch("/training/change_password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: {
        otp_code: document.getElementById("passwordOtp").value,

        new_password: document.getElementById("newPassword").value,

        confirm_password: document.getElementById("confirmPassword").value,
      },
    }),
  });

  const data = await res.json();

  alert(data.result.message || data.result.error.message);
}
