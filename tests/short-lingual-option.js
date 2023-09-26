import { WAMLDocument } from "../dist/document.js";

const content = "{{}}";
const document = new WAMLDocument(content);

console.log(document.raw);