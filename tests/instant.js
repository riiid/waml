import { WAMLDocument } from "../dist/document.js";

const content = `
Hello, World!
`;
const document = new WAMLDocument(content);

console.log(JSON.stringify(document.metadata.answerFormat));