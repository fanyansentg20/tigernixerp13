document.addEventListener("DOMContentLoaded", () => {
  const parent = document.getElementById("trainingWrapper")?.parentElement;

  parent?.style.setProperty("display", "flex", "important");
  console.log(
    "Bootstrap Tooltip Version:",
    getComputedStyle(document.querySelector(".row")).getPropertyValue(
      "--bs-gutter-x",
    ),
  );
});
