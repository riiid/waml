import { hasKind, WAML } from "./type.js";

export function findAnswer(document:WAML.Document):string|null{
  for(const v of document){
    if(typeof v === "string" || !hasKind(v, "Line")) continue;
    if(!hasKind(v.component, "Directive") || v.component.name !== "answer") continue;
    return v.component.option.value;
  }
  return null;
}