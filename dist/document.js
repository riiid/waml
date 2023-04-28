import { findReferences } from "./methods/find-references.js";
import { sanitize } from "./methods/sanitize-waml.js";
import { parseWAML } from "./parse-waml.js";
import { hasKind } from "./type.js";
export class WAMLDocument {
    constructor(data) {
        const document = typeof data === "string" ? parseWAML(data) : data;
        if ('error' in document) {
            throw SyntaxError(`Unable to parse the text: ${document.message}\n${document.stack.join('\n')}`);
        }
        this.raw = document;
    }
    sanitize(options = {}) {
        return sanitize(this.raw, options);
    }
    getMetadata() {
        const answers = [];
        for (const v of this.raw) {
            if (typeof v === "string" || !hasKind(v, "Line"))
                continue;
            if (!hasKind(v.component, "Directive") || v.component.name !== "answer")
                continue;
            if (v.component.options.length > 1) {
                answers.push({
                    type: "COMBINED",
                    children: v.component.options.map(parse)
                });
            }
            else {
                answers.push(parse(v.component.options[0]));
            }
            function parse(option) {
                switch (option.kind) {
                    case "ShortLingualOption": return { type: "SINGLE", value: [option.value] };
                    case "ButtonOption":
                    case "ChoiceOption":
                        if (typeof option.value === "string") {
                            return { type: "SINGLE", value: [option.value] };
                        }
                        return { type: "MULTIPLE", value: option.value, ordered: option.ordered };
                }
            }
        }
        return { answers };
    }
    findReferences() {
        return findReferences(this.raw);
    }
}
