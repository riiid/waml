import * as assert from "assert";
import { findAnswer } from "./find-answer.js";
import { parseWAML } from "./parse-waml.js";
import { sanitizeWAML } from "./sanitize-waml.js";
const example = `
@passage 123

# 위 밑줄 친 단어의 뜻으로 적절하지 않은 것은?

{1} 123
{2} 234
{3} 345

@answer {4}
@answer {{55}}

<explanation>
> 해당 글에서 head는 '~로 향하다'라는 의미의 동사이다.
</explanation>
`;
const document = parseWAML(example);
if ('error' in document)
    throw Error(document.message);
assert.equal(sanitizeWAML(document), `위 밑줄 친 단어의 뜻으로 적절하지 않은 것은?
123
234
345
55
해당 글에서 head는 '~로 향하다'라는 의미의 동사이다.`);
assert.equal(findAnswer(document), "4");
