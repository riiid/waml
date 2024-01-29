import { WAML } from "../type.js";
type MediumToken = WAML.MooToken<"medium">;
export declare function findReferences(document: WAML.Document): (({
    kind: "Directive";
    name: "passage";
    value: string;
} & {
    name: "passage";
}) | MediumToken)[];
export {};
