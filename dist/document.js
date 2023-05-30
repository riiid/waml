import { findAnswers, getAnswerFormat } from "./methods/find-answers.js";
import { findReferences } from "./methods/find-references.js";
import { sanitize } from "./methods/sanitize-waml.js";
import { parseWAML } from "./parse-waml.js";
export class WAMLDocument {
    constructor(data) {
        const document = typeof data === "string" ? parseWAML(data) : data;
        if ('error' in document) {
            throw SyntaxError(`Unable to parse the text: ${document.message}\n${document.stack.join('\n')}`);
        }
        const answers = findAnswers(document);
        this.raw = document;
        this.metadata = {
            answerFormat: getAnswerFormat(document, answers[0]),
            answers,
        };
    }
    sanitize(options = {}) {
        return sanitize(this.raw, options);
    }
    findReferences() {
        return findReferences(this.raw);
    }
}
