const navigation = document.querySelector("nav");
navigation.hidden = false;
navigation.addEventListener("click", event => {
  const active = event.target.closest("button[data-filter]");
  if (!active) return;
  for (const button of navigation.querySelectorAll("button")) button.setAttribute("aria-pressed", String(button === active));
  for (const story of document.querySelectorAll("article[data-beat]")) {
    story.hidden = active.dataset.filter !== "all" && active.dataset.filter !== story.dataset.beat;
  }
});
document.querySelector(".source-link").addEventListener("click", () => { document.querySelector("#sources details").open = true; });
