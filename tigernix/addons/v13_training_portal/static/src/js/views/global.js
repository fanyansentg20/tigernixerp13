// static/src/js/global.js

window.addEventListener("load", () => {
  document.querySelectorAll('a[href="/web/login"]').forEach((el) => {
    el.href = "/training/login";
  });
});
