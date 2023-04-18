import { WAML } from "../type.js";
export type SanitizationOptions = {
    'showOptionLabels'?: boolean;
};
export declare function sanitize(document: WAML.Document, { showOptionLabels }: SanitizationOptions): string;
