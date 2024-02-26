import { WAMLDocument } from "../dist/document.js";

const content = `
![1](2){"a":}
`;
const document = new WAMLDocument(content);

console.log(JSON.stringify(document.raw));