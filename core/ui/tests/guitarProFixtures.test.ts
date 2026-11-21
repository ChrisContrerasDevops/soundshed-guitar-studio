// @vitest-environment node
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import type * as AlphaTab from "@coderline/alphatab";
const require = createRequire(import.meta.url);
const at = require("@coderline/alphatab") as typeof AlphaTab;
const fixture = (name: string) => readFileSync(new URL(`./fixtures/guitar-studio/${name}`, import.meta.url));

describe("real Guitar Pro fixtures, alphaTab 1.9.0", () => {
  it.each(["notes-gp3.gp3", "notes-gp4.gp4", "notes-gp5.gp5", "notes-gp6.gpx", "notes-gp7.gp"])("reads notes, tuning and bars from %s", (name) => {
    const score = at.importer.ScoreLoader.loadScoreFromBytes(fixture(name));
    expect(score.masterBars).toHaveLength(1); expect(score.tracks).toHaveLength(1);
    const staff = score.tracks[0].staves[0];
    expect(staff.tuning).toEqual([64, 59, 55, 50, 45, 40]);
    const notes = staff.bars[0].voices.flatMap((v) => v.beats.flatMap((b) => b.notes));
    expect(notes.slice(0, 4).map((n) => n.fret)).toEqual([1, 2, 3, 4]);
  });
  it("reads the GP8 bar-number fixture (six bars of rests)", () => {
    const score = at.importer.ScoreLoader.loadScoreFromBytes(fixture("barnumbers-gp8.gp"));
    expect(score.masterBars).toHaveLength(6);
    expect(score.tracks[0].name).toBe("Steel Guitar");
    expect(score.tracks[0].staves[0].bars.every((bar) => bar.voices.every((voice) => voice.beats.every((beat) => beat.isRest)))).toBe(true);
  });
  it("reads the original multipista GP7-compatible exercise", () => {
    const score = at.importer.ScoreLoader.loadScoreFromBytes(fixture("reading-exercise.gp"));
    expect(score.title).toBe("Guitar Studio Reading Exercise");
    expect(score.masterBars).toHaveLength(12);
    expect(score.tracks.map((t) => t.name)).toEqual(["Guitar", "Bass"]);
    expect(score.tracks.map((t) => t.staves[0].tuning.length)).toEqual([6, 4]);
  });
  it("preserves the upstream fixture and license hashes", () => {
    const manifest = JSON.parse(fixture("upstream.json").toString()) as { file: string; sha256: string }[];
    for (const entry of manifest) {
      expect(createHash("sha256").update(fixture(entry.file)).digest("hex")).toBe(entry.sha256);
    }
  });
  it.each([new Uint8Array(), new Uint8Array([0, 255, 0, 255]), new Uint8Array([80, 75, 3, 4, 0])])("rejects empty, unknown or truncated content", (bytes) => {
    expect(() => at.importer.ScoreLoader.loadScoreFromBytes(bytes)).toThrow();
  });
});
