export var WAML;
(function (WAML) {
    let InteractionType;
    (function (InteractionType) {
        InteractionType[InteractionType["CHOICE_OPTION"] = 0] = "CHOICE_OPTION";
        InteractionType[InteractionType["BUTTON_OPTION"] = 1] = "BUTTON_OPTION";
        InteractionType[InteractionType["SHORT_LINGUAL_OPTION"] = 2] = "SHORT_LINGUAL_OPTION";
        InteractionType[InteractionType["LONG_LINGUAL_OPTION"] = 3] = "LONG_LINGUAL_OPTION";
        InteractionType[InteractionType["PAIRING_NET"] = 4] = "PAIRING_NET";
    })(InteractionType = WAML.InteractionType || (WAML.InteractionType = {}));
    // 0부터는 <cog>에 의해 자동 설정된 값들이 들어갑니다.
    let ChoiceOptionGroup;
    (function (ChoiceOptionGroup) {
        ChoiceOptionGroup[ChoiceOptionGroup["NUMERIC"] = -7] = "NUMERIC";
        ChoiceOptionGroup[ChoiceOptionGroup["LOWER_ALPHABETIC"] = -6] = "LOWER_ALPHABETIC";
        ChoiceOptionGroup[ChoiceOptionGroup["UPPER_ALPHABETIC"] = -5] = "UPPER_ALPHABETIC";
        ChoiceOptionGroup[ChoiceOptionGroup["HANGEUL_CONSONANTAL"] = -4] = "HANGEUL_CONSONANTAL";
        ChoiceOptionGroup[ChoiceOptionGroup["HANGEUL_FULL"] = -3] = "HANGEUL_FULL";
        ChoiceOptionGroup[ChoiceOptionGroup["LOWER_ROMAN"] = -2] = "LOWER_ROMAN";
        ChoiceOptionGroup[ChoiceOptionGroup["UPPER_ROMAN"] = -1] = "UPPER_ROMAN";
    })(ChoiceOptionGroup = WAML.ChoiceOptionGroup || (WAML.ChoiceOptionGroup = {}));
    let LinePrefix;
    (function (LinePrefix) {
        LinePrefix["QUESTION"] = "#";
        LinePrefix["QUOTATION"] = ">";
        LinePrefix["INDENTATION"] = "|";
    })(LinePrefix = WAML.LinePrefix || (WAML.LinePrefix = {}));
})(WAML || (WAML = {}));
