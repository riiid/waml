import { WAML } from "../type.js";
type MediumToken = WAML.MooToken<'medium'>;
export declare function findReferences(document: WAML.Document): (({
    kind: "Directive";
    name: "passage";
    path: string;
} & {
    name: "passage";
}) | MediumToken)[];
export {};
