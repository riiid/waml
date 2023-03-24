export var WAML;
(function (WAML) {
    let LinePrefix;
    (function (LinePrefix) {
        LinePrefix["QUESTION"] = "#";
        LinePrefix["QUOTATION"] = ">";
    })(LinePrefix = WAML.LinePrefix || (WAML.LinePrefix = {}));
})(WAML || (WAML = {}));
export function isMooToken(value, type) {
    return value && "type" in value && value.type === type && "line" in value && "col" in value;
}
