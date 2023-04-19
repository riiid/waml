import { findReferences } from "./methods/find-references.js";
import { SanitizationOptions, sanitize } from "./methods/sanitize-waml.js";
import { parseWAML } from "./parse-waml.js";
import { hasKind, WAML } from "./type.js";

export class WAMLDocument{
  public readonly raw:WAML.Document;
  
  constructor(text:string){
    const document = parseWAML(text);

    if('error' in document){
      throw SyntaxError(`Unable to parse the text: ${document.message}\n${document.stack.join('\n')}`);
    }
    this.raw = document;
  }
  public sanitize(options:SanitizationOptions = {}):string{
    return sanitize(this.raw, options);
  }
  public findAnswer():WAML.Answer[]{
    const R:WAML.Answer[] = [];

    for(const v of this.raw){
      if(typeof v === "string" || !hasKind(v, "Line")) continue;
      if(!hasKind(v.component, "Directive") || v.component.name !== "answer") continue;

      if(v.component.options.length > 1){
        R.push({
          type: "Combined",
          children: v.component.options.map(parse)
        })
      }else{
        R.push(parse(v.component.options[0]));
      }
      function parse(option:WAML.InlineOption):Exclude<WAML.Answer, { type: "Combined" }>{
        switch(option.kind){
          case "ShortLingualOption": return { type: "Single", value: option.value };
          case "ButtonOption":
          case "ChoiceOption":
            if(typeof option.value === "string"){
              return { type: "Single", value: option.value };
            }
            return { type: "Multiple", value: option.value, ordered: option.ordered };
        }
      }
    }
    return R;
  }
  public findReferences(){
    return findReferences(this.raw);
  }
}