import { SanitizationOptions } from "./methods/sanitize-waml.js";
import { WAML } from "./type.js";
export declare class WAMLDocument {
    readonly raw: WAML.Document;
    constructor(text: string);
    sanitize(options?: SanitizationOptions): string;
    findAnswer(): WAML.Answer[];
    findReferences(): (({
        kind: "Directive";
        name: "passage";
        path: string;
    } & {
        name: "passage";
    }) | {
        type: "medium";
        value: {
            type: "image";
            title: string;
            url: string;
        };
        text: string;
        offset: number;
        lineBreaks: number;
        line: number;
        col: number;
    })[];
}
