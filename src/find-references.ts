import { hasKind, isMooToken, WAML } from "./type.js";

type PassageImportToken = WAML.Directive&{ 'name': "passage" };
type MediumToken = WAML.MooToken<'medium'>;

export function findReferences(document:WAML.Document){
  const R:Array<PassageImportToken|MediumToken> = [];
  
  for(const v of document){
    if(typeof v === "string" || !hasKind(v, "Line")) continue;
    if(hasKind(v.component, "Directive") && v.component.name === "passage"){
      R.push(v.component);
    }
    if(hasKind(v.component, "LineComponent")){
      iterate(v.component.inlines);
    }
  }
  return R;

  function iterate(inlines:WAML.Inline[]):void{
    for(const v of inlines){
      if(typeof v === "string") continue;
      if(isMooToken(v, "medium")) R.push(v);
      else if(hasKind(v, "StyledInline")) iterate(v.inlines);
      else if(hasKind(v, "ClassedInline")) iterate(v.inlines);
    }
  }
}