const requestedSlide = new URLSearchParams(window.location.search).get("slide");
if (requestedSlide) {
  const active = document.querySelector(`[data-slide="${CSS.escape(requestedSlide.padStart(2, "0"))}"]`);
  if (active) {
    document.body.classList.add("single-slide");
    active.classList.add("preview-active");
  }
}
