import { beforeEach, describe, expect, it, vi } from "vitest";
const view = vi.hoisted(() => ({ closeScore: vi.fn(), openScore: vi.fn().mockResolvedValue(undefined), setTabReference: vi.fn(), applySyncPoints: vi.fn(), getPlaybackOrder: () => [], showTrack: vi.fn() }));
const bridge = vi.hoisted(() => ({ requestPracticeToolTab: vi.fn(), setAppSetting: vi.fn() }));
vi.mock("../ts/practiceTool/tab/tabView.js", () => view);
vi.mock("../ts/bridge.js", () => bridge);
import { beginTabImport, closeTab, getTabError, getTrackNames, onScoreParsed, onTabFileFailed, onTabFileLoaded } from "../ts/practiceTool/tab/session.js";
import { getTabBinding } from "../ts/practiceTool/tab/tabState.js";
import { uiState } from "../ts/state.js";

beforeEach(() => { uiState.appSettings = {}; closeTab(); vi.clearAllMocks(); });
describe("correlated score imports", () => {
  const payload = { id: "score-a", fileName: "fixture.gp", data: "YWJj" };
  it("ignores a late native response after close", () => {
    const requestId = beginTabImport(); closeTab();
    onTabFileLoaded({ ...payload, requestId });
    expect(view.openScore).not.toHaveBeenCalled(); expect(getTabBinding()).toBeNull();
  });
  it("ignores a superseded import and its failure", () => {
    const old = beginTabImport(); const latest = beginTabImport();
    onTabFileLoaded({ ...payload, requestId: latest });
    onTabFileFailed({ requestId: old, error: "old failure" });
    onTabFileLoaded({ ...payload, id: "older", requestId: old });
    expect(view.openScore).toHaveBeenCalledOnce(); expect(getTabBinding()?.tabId).toBe("score-a");
    expect(getTabError()).toBe("");
  });
  it("preserves a score when a dialog is cancelled", () => {
    onTabFileLoaded({ ...payload, requestId: beginTabImport() });
    onTabFileFailed({ requestId: beginTabImport(), cancelled: true });
    expect(getTabBinding()?.tabId).toBe("score-a"); expect(view.closeScore).not.toHaveBeenCalled();
  });
  it("clears stale score metadata after a failure and can recover", () => {
    onTabFileLoaded({ ...payload, requestId: beginTabImport() }); onScoreParsed(["Guitar"], "Old");
    onTabFileFailed({ requestId: beginTabImport(), error: "Missing score" });
    expect(view.closeScore).toHaveBeenCalledOnce(); expect(getTrackNames()).toEqual([]);
    onTabFileLoaded({ ...payload, requestId: beginTabImport() });
    expect(getTabError()).toBe(""); expect(view.openScore).toHaveBeenCalledTimes(2);
  });
  it("handles invalid base64 synchronously and clears the error on Close", () => {
    expect(() => onTabFileLoaded({ ...payload, data: "%broken%", requestId: beginTabImport() })).not.toThrow();
    expect(getTabError()).not.toBe(""); expect(view.closeScore).toHaveBeenCalledOnce();
    closeTab(); expect(getTabError()).toBe("");
  });
});
