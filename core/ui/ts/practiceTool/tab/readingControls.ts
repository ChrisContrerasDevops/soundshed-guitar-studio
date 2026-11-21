import { getScoreViewState, goToScoreBar, setScoreZoom } from "./tabView.js";

export function renderReadingControls(): void {
  const state = getScoreViewState();
  const controls = document.getElementById("practice-tool-tab-reading");
  if (!controls) {
    return;
  }
  controls.hidden = state.barCount === 0;
  const bar = document.getElementById("practice-tool-tab-bar") as HTMLInputElement;
  bar.max = String(state.barCount);
  bar.value = String(state.bar || 1);
  const count = document.getElementById("practice-tool-tab-bar-count");
  if (count) {
    count.textContent = `/ ${state.barCount}`;
  }
  (document.getElementById("practice-tool-tab-previous") as HTMLButtonElement).disabled = state.bar <= 1;
  (document.getElementById("practice-tool-tab-next") as HTMLButtonElement).disabled = state.bar >= state.barCount;
  (document.getElementById("practice-tool-tab-zoom") as HTMLSelectElement).value = String(Math.round(state.zoom * 100));
}

export function bindReadingControls(): void {
  const go = (bar: number) => {
    goToScoreBar(bar);
    renderReadingControls();
  };
  document.getElementById("practice-tool-tab-previous")?.addEventListener("click", () => go(getScoreViewState().bar - 1));
  document.getElementById("practice-tool-tab-next")?.addEventListener("click", () => go(getScoreViewState().bar + 1));
  const bar = document.getElementById("practice-tool-tab-bar") as HTMLInputElement | null;
  bar?.addEventListener("change", () => go(bar.valueAsNumber));
  bar?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      go(bar.valueAsNumber);
    }
  });
  const zoom = document.getElementById("practice-tool-tab-zoom") as HTMLSelectElement | null;
  zoom?.addEventListener("change", () => {
    setScoreZoom(Number(zoom.value) / 100);
    renderReadingControls();
  });
}
