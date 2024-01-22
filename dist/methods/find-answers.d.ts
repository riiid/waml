import { WAML } from "../type.js";
export declare function findAnswers(document: WAML.Document): WAML.Answer[];
export declare function getAnswerFormat(document: WAML.Document, answer?: WAML.Answer): WAML.Metadata["answerFormat"];
