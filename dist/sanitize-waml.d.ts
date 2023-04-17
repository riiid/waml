import { WAML } from "./type.js";
type SanitizationOptions = {
    'showOptionLabels'?: boolean;
};
export declare function sanitizeWAML(document: WAML.Document, { showOptionLabels }?: SanitizationOptions): string;
export {};
