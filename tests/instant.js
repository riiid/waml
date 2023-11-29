import { WAMLDocument } from "../dist/document.js";

const content = "123\n^> 456";
const document = new WAMLDocument(content);

console.log(document.raw);