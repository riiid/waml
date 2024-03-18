import assert from "assert";
import { parseWAML } from "../dist/parse-waml.js"

const content = `
((hello))
(1[hi ((there))])
)) test
<action>
onClick{
  go next
}
</action>
`.trim();

assert.strictEqual(
  JSON.stringify(parseWAML(content)),
  '[{"kind":"Line","prefixes":[],"component":{"kind":"LineComponent","inlines":[{"kind":"InlineKnob","index":0,"inlines":["h","e","l","l","o"]}]}},{"kind":"Line","prefixes":[],"component":{"kind":"LineComponent","inlines":[{"kind":"ButtonKnob","index":1,"inlines":["h","i"," ",{"kind":"InlineKnob","index":0,"inlines":["t","h","e","r","e"]}]}]}},{"kind":"Line","prefixes":[],"component":{"kind":"FigureAddon","type":"caption","inlines":["t","e","s","t"]}},{"kind":"XMLElement","tag":"action","index":0,"condition":{"type":"actionCondition","value":"onClick","text":"onClick","offset":45,"lineBreaks":0,"line":5,"col":1},"actions":[{"kind":"Action","command":"go","value":"next"}]}]'
);