import { WAMLDocument } from "../dist/document.js";

const content = "123---\n---\n456";
const document = new WAMLDocument(content);

console.log(document.raw);