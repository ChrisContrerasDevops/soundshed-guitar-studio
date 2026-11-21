import { beforeEach, describe, expect, it, vi } from "vitest";

const loader = vi.hoisted(() => ({ load: vi.fn() }));
vi.mock("../ts/practiceTool/tab/alphaTabLoader.js", () => ({
  loadAlphaTab: loader.load,
  alphaTabVendorUrl: (file: string) => `juce://juce.backend/dist/vendor/alphatab/${file}`,
}));

import { closeScore, getScoreViewState, goToScoreBar, mountTabView, openScore, setScoreZoom, setTabReference, showTrack } from "../ts/practiceTool/tab/tabView.js";

function event() {
  const listeners: ((...args: unknown[]) => void)[] = [];
  return { on: (fn: (...args: unknown[]) => void) => listeners.push(fn), emit: (...args: unknown[]) => listeners.forEach((fn) => fn(...args)) };
}

class FakeApi {
  static instances: FakeApi[] = [];
  settings = { display: { scale: 0.9 }, player: {} };
  score = { title: "Fixture", tracks: [{ index: 0, name: "Guitar" }, { index: 1, name: "Bass" }], masterBars: Array.from({ length: 12 }) };
  boundsLookup = { findMasterBarByIndex: (index: number) => ({ realBounds: { x: 20, y: index * 100 } }) };
  scoreLoaded = event(); midiLoaded = event(); postRenderFinished = event(); error = event(); playerReady = event(); beatMouseDown = event();
  destroy = vi.fn(); updateSettings = vi.fn(); render = vi.fn(() => this.postRenderFinished.emit()); renderTracks = vi.fn();
  load = vi.fn((_bytes: Uint8Array) => { this.scoreLoaded.emit(this.score); this.postRenderFinished.emit(); return true; });
  constructor() { FakeApi.instances.push(this); }
}
const namespace = {
  AlphaTabApi: FakeApi, FontFileFormat: { Woff: 1, Woff2: 2 }, LogLevel: { Warning: 2 }, LayoutMode: { Page: 0 },
  StaveProfile: { Tab: 0, ScoreTab: 1, Score: 2 }, PlayerMode: { EnabledExternalMedia: 2 }, ScrollMode: { Continuous: 1 },
  synth: { PlayerState: { Playing: 1 } },
};
let scroll: ReturnType<typeof vi.fn>;
let onError: ReturnType<typeof vi.fn>;
beforeEach(() => {
  closeScore(); setTabReference(null); setScoreZoom(0.9);
  FakeApi.instances = [];
  document.body.innerHTML = '<div id="viewport"><div id="score"></div></div>';
  scroll = vi.fn();
  document.getElementById("viewport")!.scrollTo = scroll;
  onError = vi.fn();
  mountTabView(document.getElementById("score")!, { onError, onScoreLoaded: vi.fn(), onTimingReady: vi.fn(), onRendered: vi.fn(), onBarPicked: vi.fn() }, () => true);
  loader.load.mockReset().mockResolvedValue(namespace);
});

describe("score reading and lifecycle", () => {
  it("navigates and clamps bars without seeking the reference; zoom retains the target", async () => {
    const seekMs = vi.fn(); const play = vi.fn(); const pause = vi.fn();
    setTabReference({ seekMs, play, pause, isAvailable: () => true, isPlaying: () => false, durationMs: () => 1000, positionMs: () => 0, subscribe: () => () => undefined, dispose: () => undefined });
    await openScore(new Uint8Array([1]), 0);
    goToScoreBar(8); setScoreZoom(1.5);
    expect(getScoreViewState()).toEqual({ bar: 8, barCount: 12, zoom: 1.5 });
    expect(scroll).toHaveBeenLastCalledWith({ top: 684, left: 4, behavior: "auto" });
    goToScoreBar(999); expect(getScoreViewState().bar).toBe(12);
    goToScoreBar(-1); expect(getScoreViewState().bar).toBe(1);
    goToScoreBar(NaN); setScoreZoom(NaN); expect(getScoreViewState().zoom).toBe(1.5);
    setScoreZoom(20); expect(getScoreViewState().zoom).toBe(2);
    showTrack(1); expect(FakeApi.instances[0].renderTracks).toHaveBeenCalledWith([FakeApi.instances[0].score.tracks[1]]);
    expect(seekMs).not.toHaveBeenCalled(); expect(play).not.toHaveBeenCalled(); expect(pause).not.toHaveBeenCalled();
  });

  it("does not create an instance after closing during script load", async () => {
    let resolve!: (value: unknown) => void;
    loader.load.mockReturnValue(new Promise((done) => { resolve = done; }));
    const pending = openScore(new Uint8Array([1]), 0);
    closeScore(); resolve(namespace); await pending;
    expect(FakeApi.instances).toHaveLength(0);
  });

  it("only renders the latest of two concurrent opens", async () => {
    let resolve!: (value: unknown) => void;
    loader.load.mockReturnValue(new Promise((done) => { resolve = done; }));
    const first = openScore(new Uint8Array([1]), 0);
    const second = openScore(new Uint8Array([2]), 1);
    resolve(namespace); await Promise.all([first, second]);
    expect(FakeApi.instances).toHaveLength(1);
    expect(FakeApi.instances[0].load).toHaveBeenCalledWith(new Uint8Array([2]), [1]);
  });

  it("ignores errors from a destroyed renderer", async () => {
    await openScore(new Uint8Array([1]), 0);
    const previous = FakeApi.instances[0];
    await openScore(new Uint8Array([2]), 0);
    previous.error.emit(new Error("late error"));
    expect(previous.destroy).toHaveBeenCalledOnce();
    expect(onError).not.toHaveBeenCalled();
  });
});
