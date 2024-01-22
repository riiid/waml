import { WAMLDocument } from "../dist/document.js";

const content = `[[Instruction]]
> Look at the picture from the video. Choose all the correct descriptions of the scene.
> [[sub: 다음 장면을 보고, 보기에서 장면에 대한 올바른 설명을 모두 골라 주세요.]]

![사진 제목](/3-3/question.png)

{1} Amethyst is holding a giant egg in her hand.
{2} There is milk and some bagels in the fridge.
{3} Amethyst is standing in the living room.
{4} The door to the fridge is open.
{5} The egg has light blue diamonds on it.

@answer {1, 2, 4}`;
const document = new WAMLDocument(content);

console.log(JSON.stringify(document.metadata.answers));