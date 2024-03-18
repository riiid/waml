import { WAMLDocument } from "../dist/document.js";

const content = `
He <cog>{was} / {were}</cog> tried because he <cog>{had run} / {ran}</cog> so fast.
`;
const document = new WAMLDocument(content);

console.log(JSON.stringify(document.metadata));