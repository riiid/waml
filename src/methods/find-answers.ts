import { WAML, guessChoiceOptionGroup, hasKind } from "../type.js";

const ambiguousLowerRomanValues = [ "i", "v", "x" ];
const ambiguousUpperRomanValues = [ "I", "V", "X" ];

export function findAnswers(document:WAML.Document){
  const R:WAML.Answer[] = [];

  for(const v of document){
    if(typeof v === "string" || !hasKind(v, "Line")) continue;
    if(!hasKind(v.component, "Directive") || v.component.name !== "answer") continue;

    if(v.component.options.length > 1){
      R.push({
        type: "COMBINED",
        children: v.component.options.map(parse)
      })
    }else{
      R.push(parse(v.component.options[0]));
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
  return R;
}
export function getAnswerFormat(document:WAML.Document, answer?:WAML.Answer):WAML.Metadata['answerFormat']{
  const flattenAnswers = answer ? getFlattenAnswers(answer) : [];
  const choiceOptionValues = getChoiceOptionValues(document);
  const interactions:WAML.Interaction[] = [];
  const existingChoiceOptionGroup:Record<string, WAML.Interaction&{ type: WAML.InteractionType.CHOICE_OPTION }> = {};

  for(const v of document){
    if(typeof v === "string" || !hasKind(v, "Line")) continue;
    if(hasKind(v.component, "LineComponent")){
      if(v.component.headOption?.kind === "ChoiceOption"){
        handleChoiceOption(v.component.headOption.value);
      }
      iterate(v.component.inlines);
    }
  }
  return { interactions };

  function iterate(inlines:WAML.Inline[]):void{
    for(const v of inlines){
      if(typeof v === "string") continue;
      if(hasKind(v, "StyledInline") || hasKind(v, "ClassedInline")){
        iterate(v.inlines);
      }else if(hasKind(v, "ChoiceOption")){
        handleChoiceOption(v.value);
      }else if(hasKind(v, "ButtonOption")){
        const existing = interactions.find(w => w.type === WAML.InteractionType.BUTTON_OPTION) as WAML.Interaction&{ type: WAML.InteractionType.BUTTON_OPTION };

        if(existing){
          existing.values.push(v.value);
        }else{
          interactions.push({
            index: interactions.length,
            type: WAML.InteractionType.BUTTON_OPTION,
            values: [ v.value ],
            multipleness: getMultipleness(interactions.length)
          });
        }
      }else if(hasKind(v, "ShortLingualOption")){
        interactions.push({
          index: interactions.length,
          type: WAML.InteractionType.SHORT_LINGUAL_OPTION,
          placeholder: v.value
        });
      }
    }
  }
  function handleChoiceOption(value:string):void{
    let group:ReturnType<typeof guessChoiceOptionGroup>;
        
    if(ambiguousLowerRomanValues.includes(value) && choiceOptionValues.includes("ii")){
      group = "LOWER_ROMAN";
    }else if(ambiguousUpperRomanValues.includes(value) && choiceOptionValues.includes("II")){
      group = "UPPER_ROMAN";
    }else{
      group = guessChoiceOptionGroup(value);
    }
    if(existingChoiceOptionGroup[group]){
      existingChoiceOptionGroup[group].values.push(value);
    }else{
      interactions.push(existingChoiceOptionGroup[group] = {
        index: interactions.length,
        type: WAML.InteractionType.CHOICE_OPTION,
        group,
        values: [ value ],
        multipleness: getMultipleness(interactions.length)
      });
    }
  }
  function getMultipleness(index:number){
    const chunk = flattenAnswers[index];
    if(!chunk) return undefined;
    if(chunk.type === "SINGLE") return undefined;
    return chunk.ordered ? "ordered" : "unordered";
  }
}
function getFlattenAnswers(answer:WAML.Answer){
  if(answer.type === "COMBINED"){
    return answer.children;
  }
  return [ answer ];
}
function getChoiceOptionValues(document:WAML.Document):string[]{
  const R:string[] = [];
  
  for(const v of document){
    if(typeof v === "string" || !hasKind(v, "Line")) continue;
    if(!hasKind(v.component, "LineComponent")) continue;
    if(v.component.headOption?.kind === "ChoiceOption"){
      R.push(v.component.headOption.value);
    }
    iterateForChoiceOptionValues(v.component.inlines);
  }
  return R;

  function iterateForChoiceOptionValues(inlines:WAML.Inline[]):void{
    for(const v of inlines){
      if(typeof v === "string") continue;
      if(hasKind(v, "StyledInline") || hasKind(v, "ClassedInline")) iterateForChoiceOptionValues(v.inlines);
      if(hasKind(v, "ChoiceOption")){
        R.push(v.value);
      }
    }
  }
}