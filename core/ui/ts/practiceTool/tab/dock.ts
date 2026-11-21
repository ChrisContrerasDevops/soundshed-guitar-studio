import { isJamEnabled } from "../../buildFlags.js";
import { FEATURE_FLAGS_CHANGED_EVENT, Features, isFeatureEnabled } from "../../featureFlags.js";

/** Moves the existing section: one renderer, binding and set of controls in either location. */
export function initializeScoreDock(section: HTMLElement, onShown: () => void): void {
  const button = document.getElementById("score-dock-toggle");
  const dock = document.getElementById("score-dock");
  const host = document.getElementById("score-dock-content");
  const main = document.querySelector(".main-content");
  if (!button || !dock || !host || !main) {
    return;
  }
  const home = document.createComment("Practice Tool score location");
  section.before(home);
  const show = (open: boolean) => {
    if (open) {
      host.appendChild(section);
    } else {
      home.parentNode?.insertBefore(section, home.nextSibling);
    }
    dock.hidden = !open;
    main.classList.toggle("has-score-dock", open);
    button.setAttribute("aria-expanded", String(open));
    if (open) {
      onShown();
      document.getElementById("practice-tool-tab-open")?.focus();
    }
  };
  const available = () => isJamEnabled() && isFeatureEnabled(Features.PracticeTool);
  const refresh = () => {
    button.hidden = !available();
    if (!available() && !dock.hidden) {
      show(false);
    }
  };
  button.addEventListener("click", () => {
    if (available()) {
      show(dock.hidden);
    }
  });
  document.getElementById("score-dock-hide")?.addEventListener("click", () => {
    show(false);
    button.focus();
  });
  dock.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !event.defaultPrevented) {
      event.stopPropagation();
      show(false);
      button.focus();
    }
  });
  document.addEventListener(FEATURE_FLAGS_CHANGED_EVENT, refresh);
  refresh();
}
