import * as assert from "assert";
import { WAMLDocument } from "../dist/document.js";

const content = `
{1} 1
{2} 2
{3} 3

{{test}}

<table>
[<pog>
{1 -> net} ㄱ
{2 -> net} ㄴ
{a <- net} ㄷ
{b <- net} <table>[1]===[2]</table>
</pog>]
</table>

@answer {a}{{b}}net{{1 -> a},{2 -> b}}
`;
const document = new WAMLDocument(content);

assert.deepEqual(document.metadata.answerFormat, {
  "interactions": [
    { "index": 0, "type": 0, "group": -7, "values": ["1", "2", "3"], "multipleness": undefined },
    { "index": 1, "type": 2, "placeholder": "test" },
    { "type": 4, "index": 2, "name": "net", "fromValues": ["1", "2"], "toValues": ["a", "b"] }
  ]
});