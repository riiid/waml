import { WAMLDocument } from "../dist/document.js";

const content = `
@answer {1}
@answer abc{1}
`;
const document = new WAMLDocument(content);

console.log(JSON.stringify(document.raw));