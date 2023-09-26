import { SanitizationOptions } from "./methods/sanitize-waml.js";
import { WAML } from "./type.js";
export declare class WAMLDocument {
    readonly raw: WAML.Document;
    readonly metadata: WAML.Metadata;
    constructor(data: string | WAML.Document);
    sanitize(options?: SanitizationOptions): string;
    findReferences(): (({
        kind: "Directive";
        name: "passage";
        path: string;
    } & {
        name: "passage";
    }) | {
        type: "medium";
        value: {
            type: "image" | "audio" | "video";
            uri: string;
            alt?: string;
        };
        text: string;
        offset: number;
        lineBreaks: number;
        line: number;
        col: number;
    })[];
}
