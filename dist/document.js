import { findReferences } from "./methods/find-references.js";
import { sanitize } from "./methods/sanitize-waml.js";
import { parseWAML } from "./parse-waml.js";
import { hasKind } from "./type.js";
export class WAMLDocument {
    constructor(text) {
        const document = parseWAML(text);
        if ('error' in document) {
            throw SyntaxError(`Unable to parse the text: ${document.message}\n${document.stack.join('\n')}`);
        }
        this.document = document;
    }
    sanitize(options = {}) {
        return sanitize(this.document, options);
    }
    findAnswer() {
        for (const v of this.document) {
            if (typeof v === "string" || !hasKind(v, "Line"))
                continue;
            if (!hasKind(v.component, "Directive") || v.component.name !== "answer")
                continue;
            return v.component.option.value;
        }
        return null;
    }
    findReferences() {
        return findReferences(this.document);
    }
}
