import { findReferences } from "./methods/find-references.js";
import { SanitizationOptions, sanitize } from "./methods/sanitize-waml.js";
import { parseWAML } from "./parse-waml.js";
import { hasKind, WAML } from "./type.js";

export class WAMLDocument{
  public readonly document:WAML.Document;
  
  constructor(text:string){
    const document = parseWAML(text);

    if('error' in document){
      throw SyntaxError(`Unable to parse the text: ${document.message}\n${document.stack.join('\n')}`);
    }
    this.document = document;
  }
  public sanitize(options:SanitizationOptions = {}):string{
    return sanitize(this.document, options);
  }
  public findAnswer():string|null{
    for(const v of this.document){
      if(typeof v === "string" || !hasKind(v, "Line")) continue;
      if(!hasKind(v.component, "Directive") || v.component.name !== "answer") continue;
      return v.component.option.value;
    }
    return null;
  }
  public findReferences(){
    return findReferences(this.document);
  }
}