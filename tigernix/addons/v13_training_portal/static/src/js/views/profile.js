function showAlert(type, message) {
  document.getElementById("alert-area").innerHTML = `
<div class="alert alert-${type}">
${message}
</div>
`;
}
async function loadProfile() {
  try {
    const response = await fetch("/training/current_user", {
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
    const result = await response.json();
    const user = result.result || result;
    document.getElementById("name").value = user.name || "";
    document.getElementById("email").value = user.email || "";
    document.getElementById("phone").value = user.phone || "";
    document.getElementById("mobile").value = user.mobile || "";
    document.getElementById("city").value = user.city || "";
  } catch (err) {
    console.error(err);
    showAlert("danger", "Failed to load profile");
  }
}
loadProfile();

async function sendProfileOtp() {
  const res = await fetch("/training/send_profile_otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: {
        name: document.getElementById("name").value,

        phone: document.getElementById("phone").value,

        mobile: document.getElementById("mobile").value,

        city: document.getElementById("city").value,
      },
    }),
  });

  showAlert("success", "OTP sent to your email.");
}

async function saveProfile() {
  const res = await fetch("/training/update_profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: {
        otp_code: document.getElementById("profileOtp").value,
      },
    }),
  });

  const data = await res.json();

  if (data.result.success) {
    showAlert("success", "Profile updated successfully");

    return;
  }

  showAlert("danger", data.result.error.message);
}
