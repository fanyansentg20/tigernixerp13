document.addEventListener("DOMContentLoaded", () => {
  const parent = document.getElementById("changeEmailContainer")?.parentElement;

  parent?.style.setProperty("display", "flex", "important");
});

async function sendEmailOtp() {
  await fetch("/training/send_email_otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: {
        new_email: document.getElementById("newEmail").value,
      },
    }),
  });

  alert("OTP sent.");
}

async function changeEmail() {
  const res = await fetch("/training/change_email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: {
        otp_code: document.getElementById("emailOtp").value,
      },
    }),
  });

  const data = await res.json();

  if (data.result.success) {
    alert("Email updated to : " + data.result.email);
  }
}
