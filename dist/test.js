import * as assert from "assert";
import { WAMLDocument } from "./document.js";
const example = `
@passage 123

# 다음 글의 빈 칸에 들어갈 말로 가장 적절한것은?

[[Box]]
> Pay attention to the listener. Sometimes people may __                 __. Don’t say, “Why aren’t you listening to me?” Change the topic, or your partner will fall asleep. Give the other person a chance to talk.

{1} 123
{2} 234
{3} 345

@answer {4}
@answer {{55}}

<explanation>
> 해당 글에서 head는 '~로 향하다'라는 의미의 동사이다.
</explanation>
`;
const document = new WAMLDocument(example);
assert.equal(document.sanitize({ showOptionLabels: true }), `다음 글의 빈 칸에 들어갈 말로 가장 적절한것은?
Pay attention to the listener. Sometimes people may                  . Don’t say, “Why aren’t you listening to me?” Change the topic, or your partner will fall asleep. Give the other person a chance to talk.
① 123
② 234
③ 345
55
해당 글에서 head는 '~로 향하다'라는 의미의 동사이다.`);
assert.equal(document.findAnswer(), "4");
assert.equal(document.findReferences()[0].name, "passage");
