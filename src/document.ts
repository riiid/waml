import { findReferences } from "./methods/find-references.js";
import { SanitizationOptions, sanitize } from "./methods/sanitize-waml.js";
import { parseWAML } from "./parse-waml.js";
import { hasKind, WAML } from "./type.js";

export class WAMLDocument{
  public readonly raw:WAML.Document;
  
  constructor(data:string|WAML.Document){
    const document = typeof data === "string" ? parseWAML(data) : data;

    if('error' in document){
      throw SyntaxError(`Unable to parse the text: ${document.message}\n${document.stack.join('\n')}`);
    }
    this.raw = document;
  }
  public sanitize(options:SanitizationOptions = {}):string{
    return sanitize(this.raw, options);
  }
  public getMetadata():WAML.Metadata{
    const answers:WAML.Answer[] = [];

    for(const v of this.raw){
      if(typeof v === "string" || !hasKind(v, "Line")) continue;
      if(!hasKind(v.component, "Directive") || v.component.name !== "answer") continue;

      if(v.component.options.length > 1){
        answers.push({
          type: "COMBINED",
          children: v.component.options.map(parse)
        })
      }else{
        answers.push(parse(v.component.options[0]));
      }
      function parse(option:WAML.Options[number]):Exclude<WAML.Answer, { type: "COMBINED" }>{
        switch(option.kind){
          case "ShortLingualOption": return { type: "SINGLE", value: [ option.value ] };
          case "ButtonOption":
          case "ChoiceOption":
            if(typeof option.value === "string"){
              return { type: "SINGLE", value: [ option.value ] };
            }
            return { type: "MULTIPLE", value: option.value, ordered: option.ordered };
        }
      }
    }
    return { answers };
  }
  public findReferences(){
    return findReferences(this.raw);
  }
}