import assert from "assert";
import { parseWAML } from "../dist/parse-waml.js"

const content = `
((hello))
(1[hi ((there))])
)) test
`.trim();

assert.strictEqual(
  JSON.stringify(parseWAML(content)),
  '[{"kind":"Line","prefixes":[],"component":{"kind":"LineComponent","inlines":[{"kind":"InlineKnob","index":0,"inlines":["h","e","l","l","o"]}]}},{"kind":"Line","prefixes":[],"component":{"kind":"LineComponent","inlines":[{"kind":"ButtonKnob","index":1,"inlines":["h","i"," ",{"kind":"InlineKnob","index":0,"inlines":["t","h","e","r","e"]}]}]}},{"kind":"Line","prefixes":[],"component":{"kind":"FigureAddon","type":"caption","inlines":["t","e","s","t"]}}]'
);