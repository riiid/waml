import { WAML } from "./type.js";
type ParsingOptions = {
    'removeAnswers'?: boolean;
};
export declare function parseWAML(text: string, options?: ParsingOptions): WAML.Document | WAML.ParserError;
export {};
