document.addEventListener("DOMContentLoaded", () => {
  const parent = document.getElementById("trainingWrapper")?.parentElement;

  parent?.style.setProperty("display", "flex", "important");
});

const activateTabFromUrl = () => {
  const pattern = new URLPattern({
    pathname: "/:tab",
  });
  const match = pattern.exec(location.href);
  const tab = match?.pathname.groups.tab || "dashboard";

  for (el of document.getElementById("trainingMenu").children) {
    if (el.name === tab) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  }

  for (el of document.getElementById("trainingContent").children) {
    if (el.id === tab) {
      el.classList.add("show", "active");
    } else {
      el.classList.remove("show", "active");
    }
  }
};

activateTabFromUrl();
