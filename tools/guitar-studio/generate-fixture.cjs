// Original synthetic reading exercise; uses the project's pinned alphaTab exporter.
const fs = require("node:fs");
const path = require("node:path");
const at = require("../../core/ui/node_modules/@coderline/alphatab/dist/alphaTab.js");
const directory = path.resolve(__dirname, "../../core/ui/tests/fixtures/guitar-studio");
const guitar = Array.from({ length: 12 }, (_, bar) => `:4 ${bar % 5}.6 1.5 2.4 3.3`).join(" | ");
const bass = Array.from({ length: 12 }, () => ":2 0.4 2.4").join(" | ");
const tex = `\\title "Guitar Studio Reading Exercise" \\tempo 100
\\track "Guitar" \\instrument 25 . ${guitar}
\\track "Bass" \\instrument 34 \\tuning G2 D2 A1 E1 . ${bass}`;
const score = at.importer.ScoreLoader.loadAlphaTex(tex);
fs.mkdirSync(directory, { recursive: true });
fs.writeFileSync(path.join(directory, "reading-exercise.gp"), new at.exporter.Gp7Exporter().export(score));
console.log("Generated reading-exercise.gp: 12 bars, Guitar + Bass, 100 bpm");
