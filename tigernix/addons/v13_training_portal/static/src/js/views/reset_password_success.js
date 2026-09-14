document.addEventListener("DOMContentLoaded", () => {
  const parent = document.getElementById(
    "resetPasswordSuccessContainer",
  )?.parentElement;

  parent?.style.setProperty("display", "flex", "important");

  setTimeout(() => {
    window.location.href = "/";
  }, 7000);
});
