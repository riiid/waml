import { findAnswers, getAnswerFormat } from "./methods/find-answers.js";
import { findReferences } from "./methods/find-references.js";
import { SanitizationOptions, sanitize } from "./methods/sanitize-waml.js";
import { parseWAML } from "./parse-waml.js";
import { WAML } from "./type.js";

export class WAMLDocument{
  public readonly raw:WAML.Document;
  public readonly metadata:WAML.Metadata;
  
  constructor(data:string|WAML.Document){
    const document = typeof data === "string" ? parseWAML(data) : data;
    if('error' in document){
      throw SyntaxError(`Unable to parse the text: ${document.message}\n${document.stack.join('\n')}`);
    }
    const answers = findAnswers(document);

    this.raw = document;
    this.metadata = {
      answerFormat: getAnswerFormat(document, answers[0]),
      answers,
    };
  }
  public sanitize(options:SanitizationOptions = {}):string{
    return sanitize(this.raw, options);
  }
  public findReferences(){
    return findReferences(this.raw);
  }
}