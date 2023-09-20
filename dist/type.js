export var WAML;
(function (WAML) {
    let InteractionType;
    (function (InteractionType) {
        InteractionType[InteractionType["CHOICE_OPTION"] = 0] = "CHOICE_OPTION";
        InteractionType[InteractionType["BUTTON_OPTION"] = 1] = "BUTTON_OPTION";
        InteractionType[InteractionType["SHORT_LINGUAL_OPTION"] = 2] = "SHORT_LINGUAL_OPTION";
    })(InteractionType = WAML.InteractionType || (WAML.InteractionType = {}));
    let ChoiceOptionGroup;
    (function (ChoiceOptionGroup) {
        ChoiceOptionGroup[ChoiceOptionGroup["NUMERIC"] = 0] = "NUMERIC";
        ChoiceOptionGroup[ChoiceOptionGroup["LOWER_ALPHABETIC"] = 1] = "LOWER_ALPHABETIC";
        ChoiceOptionGroup[ChoiceOptionGroup["UPPER_ALPHABETIC"] = 2] = "UPPER_ALPHABETIC";
        ChoiceOptionGroup[ChoiceOptionGroup["HANGEUL_CONSONANTAL"] = 3] = "HANGEUL_CONSONANTAL";
        ChoiceOptionGroup[ChoiceOptionGroup["HANGEUL_FULL"] = 4] = "HANGEUL_FULL";
        ChoiceOptionGroup[ChoiceOptionGroup["LOWER_ROMAN"] = 5] = "LOWER_ROMAN";
        ChoiceOptionGroup[ChoiceOptionGroup["UPPER_ROMAN"] = 6] = "UPPER_ROMAN";
    })(ChoiceOptionGroup = WAML.ChoiceOptionGroup || (WAML.ChoiceOptionGroup = {}));
    let LinePrefix;
    (function (LinePrefix) {
        LinePrefix["QUESTION"] = "#";
        LinePrefix["QUOTATION"] = ">";
        LinePrefix["INDENTATION"] = "|";
    })(LinePrefix = WAML.LinePrefix || (WAML.LinePrefix = {}));
})(WAML || (WAML = {}));
