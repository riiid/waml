import { WAMLDocument } from "../dist/document.js";

const content = `
{1} <table>
[a][b]
</table>
`;
const document = new WAMLDocument(content);

console.log(JSON.stringify(document.raw));