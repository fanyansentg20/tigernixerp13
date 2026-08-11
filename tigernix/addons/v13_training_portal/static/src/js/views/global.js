// static/src/js/global.js

window.addEventListener("load", () => {
  const style = document.createElement("style");

  style.innerHTML = `
    #trainingContent .tab-pane.active {
      display: flex !important;
    }
    
    .training-row {
      row-gap: 1.5rem;
    }
  `;

  document.head.appendChild(style);
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
    .before(changeEmailMenuList, changePasswordMenuList);
});
