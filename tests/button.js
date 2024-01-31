import { WAMLDocument } from "../dist/document.js";

const content = `
{[___]} {[___]}
{{}}

{[1]}{[2]}

@answer {[1]}{[2]}
`;
console.log(JSON.stringify(new WAMLDocument(content).metadata.answerFormat));