import { hasKind, isMooToken } from "../check.js";
import { WAML } from "../type.js";
import { getCircledLetter } from "../utility.js";

export type SanitizationOptions = {
  'showOptionLabels'?: boolean
};
export function sanitize(document:WAML.Document, { showOptionLabels = false }:SanitizationOptions):string{
  return iterate(document).trim();

  function iterate(nodes:WAML.Document|WAML.Inline[], initialLine:string[] = []):string{
    const line = initialLine;

    for(const v of nodes){
      if(typeof v === "string"){
        line.push(v);
        continue;
      }
      if(isMooToken(v, 'lineComment')){
        continue;
      }
      if(hasKind(v, "XMLElement")){
        if(v.tag === "explanation"){
          line.push(iterate(v.content) + "\n");
        }
        continue;
      }
      if(hasKind(v, "Line")){
        if(v.component === null){
          continue;
        }
        if(isMooToken(v.component, 'longLingualOption')){
          continue;
        }
        if(isMooToken(v.component, 'hr')){
          continue;
        }
        switch(v.component.kind){
          case "ClassedBlock": continue;
          case "Directive":
            if(v.component.name === "answer"){
              for(const w of v.component.options){
                if(w.kind !== "ShortLingualOption") continue;
                line.push(w.value + "\n");
              }
            }
            continue;
          case "LineComponent":
            line.push(iterate(
              v.component.inlines,
              v.component.headOption && showOptionLabels ? [ `${getCircledLetter(v.component.headOption.value)} ` ] : []
            ) + "\n");
            continue;
          case "Footnote":
            line.push(iterate(v.component.inlines) + "\n");
            continue;
          case "Math":
            line.push(v.component.content + "\n");
            continue;
        }
      }
      if(isMooToken(v, 'medium')){
        if(v.value.alt) line.push(`[${v.value.alt}]\n`);
        continue;
      }
      switch(v.kind){
        case "ChoiceOption":
        case "ButtonOption":
          if(showOptionLabels){
            line.push(getCircledLetter(v.value));
          }
          continue;
        case "ClassedInline":
        case "StyledInline":
          line.push(iterate(v.inlines));
          continue;
        case "Math":
          line.push(v.content + "\n");
          continue;
      }
    }
    return line.join('');
  }
}