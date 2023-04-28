import { hasKind, isMooToken } from "./type.js";
import Nearley from "nearley";
import Grammar from "../res/waml.cjs";
const grammar = Nearley.Grammar.fromCompiled(Grammar);
export function parseWAML(text, options = {}) {
    const parser = new Nearley.Parser(grammar);
    try {
        parser.feed(text);
        if (!parser.results.length) {
            return {
                error: true,
                message: "Invalid input"
            };
        }
        if (parser.results.length > 1) {
            console.warn(`Ambiguous input (${parser.results.length})`, text);
        }
        const R = parser.results[0];
        if (options.removeAnswers)
            removeAnswers(R);
        return R;
    }
    catch (error) {
        if (!isNearleyError(error)) {
            throw error;
        }
        const chunk = error.message.split(/\r?\n/);
        return {
            error: true,
            message: chunk[0],
            stack: chunk.slice(2),
        };
    }
}
function removeAnswers(document) {
    for (let i = 0; i < document.length; i++) {
        const v = document[i];
        if (isMooToken(v, "lineComment")) {
            document.splice(i--, 1);
            continue;
        }
        if (v.kind === "XMLElement" && v.tag === "explanation") {
            document.splice(i--, 1);
            continue;
        }
        if (v.kind === "Line" && hasKind(v.component, "Directive") && v.component.name === "answer") {
            document.splice(i--, 1);
            continue;
        }
    }
}
function isNearleyError(error) {
    return (error instanceof Error &&
        (error.message.startsWith("invalid syntax at") || error.message.startsWith("Syntax error at")));
}
