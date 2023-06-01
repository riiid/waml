import { WAML } from "./type.js";
import { hasKind, isMooToken } from "./check.js";
import Nearley from "nearley";
import Grammar from "../res/waml.cjs";

const grammar = Nearley.Grammar.fromCompiled(Grammar);

type ParsingOptions = {
  'removeAnswers'?: boolean
};
export function parseWAML(text:string, options:ParsingOptions = {}):WAML.Document|WAML.ParserError{
  const parser = new Nearley.Parser(grammar);

  try {
    parser.feed(text);
    if(!parser.results.length){
      return {
        error: true,
        message: "Invalid input"
      };
    }
    if (parser.results.length > 1) {
      console.warn(`Ambiguous input (${parser.results.length})`, text);
    }
    const R = parser.results[0];

    if(options.removeAnswers) removeAnswers(R);
    return R;
  } catch (error) {
    if (!isNearleyError(error)) {
      throw error;
    }
    const chunk = error.message.split(/\r?\n/);

    return {
      error: true,
      message: chunk[0],
      stack: chunk.slice(2),
    };
  }
}
function removeAnswers(document:WAML.Document):void{
  for(let i = 0; i < document.length; i++){
    const v = document[i];

    if(isMooToken(v, "lineComment")){
      document.splice(i--, 1);
      continue;
    }
    if(v.kind === "XMLElement" && v.tag === "explanation"){
      document.splice(i--, 1);
      continue;
    }
    if(v.kind === "Line" && hasKind(v.component, "Directive") && v.component.name === "answer"){
      for(const w of v.component.options){
        if(typeof w.value === "string") w.value = "";
        else w.value = [];
      }
      continue;
    }
  }
}
function isNearleyError(error: unknown): error is Error {
  return (
    error instanceof Error &&
    (error.message.startsWith("invalid syntax at") || error.message.startsWith("Syntax error at"))
  );
}