// Exercises production modules in WKWebView, with explicit simulated native replies.
const send = (body) => window.webkit.messageHandlers.smoke.postMessage(body);
const results = [];
const workers = { created: 0, live: 0, peak: 0 };
const BrowserWorker = window.Worker;
window.Worker = class extends BrowserWorker {
  ended = false;
  constructor(...args) {
    super(...args);
    workers.created++; workers.live++; workers.peak = Math.max(workers.peak, workers.live);
  }
  terminate() {
    if (!this.ended) { this.ended = true; workers.live--; }
    return super.terminate();
  }
};
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const until = async (test, message) => {
  const start = performance.now();
  while (!test()) {
    if (performance.now() - start > 12000) throw new Error(message);
    await pause(50);
  }
};
const dom = (html) => new DOMParser().parseFromString(html, "text/html");
const read = async (url) => (await fetch(url)).text();
try {
  document.body.classList.add("theme-light");
  const index = dom(await read("/index.html"));
  for (const link of index.querySelectorAll('link[rel="stylesheet"]')) document.head.append(link);
  const header = dom(await read("/ui-components/header-icon-bar.html"));
  document.getElementById("header").append(header.querySelector("header"));
  const jam = dom(await read("/ui-components/panels/jam-panel.html"));
  document.getElementById("jam-section-panel-practice-tool").append(jam.getElementById("practice-tool-tab-section"));
  const main = dom(await read("/ui-components/main-content.html"));
  document.querySelector("main").append(main.getElementById("score-dock"));
  const messages = [];
  window.IPlugSendMsg = (json) => messages.push(JSON.parse(json));
  const panel = await import("/dist/practiceTool/tab/panel.js");
  const session = await import("/dist/practiceTool/tab/session.js");
  const view = await import("/dist/practiceTool/tab/tabView.js");
  const byId = (id) => document.getElementById(`practice-tool-tab-${id}`);
  const change = (id, value) => { byId(id).value = value; byId(id).dispatchEvent(new Event("change")); };
  panel.initializePracticeToolTab();
  const surface = byId("surface");
  const open = async (name) => {
    byId("open").click();
    const request = messages.at(-1);
    assert(request.type === "browsePracticeToolTab", "Open must use the native bridge");
    const bytes = new Uint8Array(await (await fetch(`/tests/fixtures/guitar-studio/${name}`)).arrayBuffer());
    session.onTabFileLoaded({ id: name, fileName: name, data: btoa(String.fromCharCode(...bytes)), requestId: request.requestId });
    await until(() => surface.querySelector("svg") && view.hasScore(), `No SVG for ${name}: ${session.getTabError()}`);
    await pause(200);
    assert(!session.getTabError(), session.getTabError());
    results.push({ file: name, ...view.getScoreViewState(), svg: surface.querySelectorAll("svg").length });
    send({ progress: `Rendered ${name}` });
  };
  document.getElementById("score-dock-toggle").click();
  assert(document.getElementById("score-dock").contains(surface), "Dock must move the existing surface");
  for (const name of ["notes-gp3.gp3", "notes-gp4.gp4", "notes-gp5.gp5", "notes-gp6.gpx", "notes-gp7.gp", "barnumbers-gp8.gp", "reading-exercise.gp"]) await open(name);
  assert(byId("track").options.length === 2, "Expected two tracks");
  change("staves", "scoretab"); change("zoom", "150");
  await pause(500);
  change("bar", "12");
  assert(view.getScoreViewState().bar === 12 && byId("viewport").scrollTop > 0, "Bar navigation must scroll the score");
  byId("previous").click(); assert(view.getScoreViewState().bar === 11, "Previous bar");
  change("track", "1"); await pause(300); assert(byId("track").value === "1", "Track selection");
  for (const profile of ["score", "tab", "scoretab"]) { change("staves", profile); await pause(250); assert(surface.querySelector("svg"), `Missing ${profile} render`); }
  assert(!messages.some((m) => ["setPracticeToolTransport", "seekPracticeToolFile", "setParameter", "loadPreset"].includes(m.type)), "Reading must not change audio/transport");
  document.getElementById("score-dock-hide").click();
  assert(document.getElementById("jam-section-panel-practice-tool").contains(surface), "Hide must return the same surface");
  document.getElementById("score-dock-toggle").click();
  const badRequest = session.beginTabImport();
  session.onTabFileLoaded({ id: "broken", fileName: "broken.gp", data: btoa("not a Guitar Pro file"), requestId: badRequest });
  await until(() => Boolean(session.getTabError()), "Invalid file must produce an error");
  assert(!surface.querySelector("svg"), "Invalid file must clear stale notation");
  await open("reading-exercise.gp");
  for (let cycle = 0; cycle < 20; ++cycle) {
    byId("close").click();
    assert(workers.live === 0, "Close must terminate owned workers");
    await open("reading-exercise.gp");
  }
  assert(surface.querySelectorAll(".practice-tool-tab-sync-layer").length === 1, "Only one marker layer after repeated opens");
  change("track", "0"); change("zoom", "90"); change("staves", "scoretab"); change("bar", "1");
  await pause(400);
  const remoteResources = performance.getEntriesByType("resource").filter((entry) => /^https?:/.test(entry.name)).map((entry) => entry.name);
  assert(remoteResources.length === 0, "Local score viewing must not fetch remote resources");
  assert(document.documentElement.scrollWidth <= innerWidth, "Dock must fit the window width");
  send({ success: true, results, cycles: 20, workers, width: innerWidth, remoteResources, checks: ["native request emitted", "SVG per fixture", "tracks", "three stave profiles", "zoom", "bar scroll", "dock identity", "invalid-file recovery", "workers released on close", "no audio/transport messages"] });
} catch (error) { send({ success: false, error: String(error), results }); }
