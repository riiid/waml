const choiceOptionGroupPatterns = {
    NUMERIC: /^\d+$/,
    LOWER_ALPHABETIC: /^[a-z]$/,
    UPPER_ALPHABETIC: /^[A-Z]$/,
    HANGEUL_CONSONANTAL: /^[ㄱ-ㅎ]$/,
    HANGEUL_FULL: /^[가나다라마바사아자차카타파하]$/,
    LOWER_ROMAN: /^(?!$)x{0,3}(i{1,3}|i[vx]|vi{0,3})?$/,
    UPPER_ROMAN: /^(?!$)X{0,3}(I{1,3}|I[VX]|VI{0,3})?$/, // 39까지 지원
};
export var WAML;
(function (WAML) {
    let InteractionType;
    (function (InteractionType) {
        InteractionType[InteractionType["CHOICE_OPTION"] = 0] = "CHOICE_OPTION";
        InteractionType[InteractionType["BUTTON_OPTION"] = 1] = "BUTTON_OPTION";
        InteractionType[InteractionType["SHORT_LINGUAL_OPTION"] = 2] = "SHORT_LINGUAL_OPTION";
    })(InteractionType = WAML.InteractionType || (WAML.InteractionType = {}));
    let LinePrefix;
    (function (LinePrefix) {
        LinePrefix["QUESTION"] = "#";
        LinePrefix["QUOTATION"] = ">";
    })(LinePrefix = WAML.LinePrefix || (WAML.LinePrefix = {}));
})(WAML || (WAML = {}));
export function isMooToken(value, type) {
    return value && "type" in value && value.type === type && "line" in value && "col" in value;
}
export function hasKind(value, kind) {
    return value && 'kind' in value && value.kind === kind;
}
export function guessChoiceOptionGroup(value) {
    for (const [k, v] of Object.entries(choiceOptionGroupPatterns)) {
        if (v.test(value))
            return k;
    }
    return null;
}
