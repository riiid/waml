import { WAML } from "./type.js";

const choiceOptionGroupPatterns:Record<WAML.ChoiceOptionGroup, RegExp> = {
  [WAML.ChoiceOptionGroup.NUMERIC]: /^\d+$/,
  [WAML.ChoiceOptionGroup.LOWER_ALPHABETIC]: /^[a-z]$/,
  [WAML.ChoiceOptionGroup.UPPER_ALPHABETIC]: /^[A-Z]$/,
  [WAML.ChoiceOptionGroup.HANGEUL_CONSONANTAL]: /^[ㄱ-ㅎ]$/,
  [WAML.ChoiceOptionGroup.HANGEUL_FULL]: /^[가나다라마바사아자차카타파하]$/,
  [WAML.ChoiceOptionGroup.LOWER_ROMAN]: /^(?!$)x{0,3}(i{1,3}|i[vx]|vi{0,3})?$/, // 39까지 지원
  [WAML.ChoiceOptionGroup.UPPER_ROMAN]: /^(?!$)X{0,3}(I{1,3}|I[VX]|VI{0,3})?$/, // 39까지 지원
};

export function isMooToken<T extends WAML.MooTokenType>(
  value: object,
  type: T
): value is WAML.MooToken<T> {
  return value && "type" in value && value.type === type && "line" in value && "col" in value;
}
export function hasKind<T extends string>(value:object, kind:T):value is { kind: T }{
  return value && 'kind' in value && value.kind === kind;
}
export function guessChoiceOptionGroup(value:string):WAML.ChoiceOptionGroup{
  for(const [ k, v ] of Object.entries(choiceOptionGroupPatterns)){
    if(v.test(value)) return parseInt(k);
  }
  return null;
}