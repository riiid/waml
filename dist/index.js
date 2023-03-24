import Nearley from "nearley";
import Grammar from "../res/waml.cjs";
const grammar = Nearley.Grammar.fromCompiled(Grammar);
export * from "./type.js";
export function parseWAML(text) {
    const parser = new Nearley.Parser(grammar);
    try {
        parser.feed(text);
        if (parser.results.length) {
            if (parser.results.length > 1) {
                console.warn(`Ambiguous input (${parser.results.length})`, text);
            }
            return parser.results[0];
        }
        return {
            error: true,
            message: "Invalid input"
        };
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
function isNearleyError(error) {
    return (error instanceof Error &&
        (error.message.startsWith("invalid syntax at") || error.message.startsWith("Syntax error at")));
}
