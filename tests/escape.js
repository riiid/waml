import * as assert from "assert";
import { WAMLDocument } from "../dist/document.js";

const content = `
@passage 123

# 다음 글의 빈 칸에 들어갈 말로 가장 적절한것은?

[[Box]]
> Pay attention to the listener. Sometimes people may __                 __. Don’t say, “Why aren’t you listening to me?” Change the topic, or your partner will fall asleep. Give the other person a chance to talk.
> [[Test:]]

{ㄱ\\,,} 1
{ㄴ} 2
{ㄷ} 3
{{}}

@answer {ㄱ\\,,}{{123,}}

<explanation>
> 해당 글에서 head는 '~로 향하다'라는 의미의 동사이다.
</explanation>
`;
const document = new WAMLDocument(content);

assert.deepEqual(document.metadata.answers, [
    {
        type: "COMBINED",
        children: [
            { type: "MULTIPLE", value: ["ㄱ,"], ordered: false },
            { type: "SINGLE", value: ["123,"] }
        ]
    }
]);
assert.equal(document.findReferences()[0].name, "passage");
