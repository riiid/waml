import { WAML } from "../type.js";
import { hasKind, guessChoiceOptionGroup, isMooToken } from "../check.js";
const ambiguousLowerRomanValues = ["i", "v", "x"];
const ambiguousUpperRomanValues = ["I", "V", "X"];
export function findAnswers(document) {
    const R = [];
    for (const v of document) {
        if (typeof v === "string" || !hasKind(v, "Line"))
            continue;
        if (!hasKind(v.component, "Directive") || v.component.name !== "answer")
            continue;
        if (v.component.options.length > 1) {
            R.push({
                type: "COMBINED",
                children: v.component.options.map(parse)
            });
        }
        else {
            R.push(parse(v.component.options[0]));
        }
        function parse(option) {
            switch (option.kind) {
                case "ShortLingualOption": return { type: "SINGLE", value: [option.value] };
                case "ButtonOption":
                case "ChoiceOption":
                    if (typeof option.value === "string") {
                        return { type: "SINGLE", value: [option.value] };
                    }
                    // NOTE `@answer {2,1}`이라 적었을 때 학생이 1 -> 2 순으로 답을 내는 경우에도 정답 처리하기 위함
                    if (!option.ordered)
                        option.value.sort();
                    return { type: "MULTIPLE", value: option.value, ordered: option.ordered };
            }
        }
    }
    return R;
}
export function getAnswerFormat(document, answer) {
    var _a;
    const flattenAnswers = answer ? getFlattenAnswers(answer) : [];
    const choiceOptionValues = getChoiceOptionValues(document);
    const interactions = [];
    const existingChoiceOptionGroup = {};
    const existingButtonOptionGroup = {};
    for (const v of document) {
        if (typeof v === "string" || !hasKind(v, "Line"))
            continue;
        if (hasKind(v.component, "LineComponent")) {
            switch ((_a = v.component.headOption) === null || _a === void 0 ? void 0 : _a.kind) {
                case undefined: break;
                case "ChoiceOption":
                    handleChoiceOption(v.component.headOption.value);
                    break;
                case "ShortLingualOption":
                    iterate([v.component.headOption]);
                    break;
                default:
                    throw Error(`Unhandled headOption: ${v.component.headOption['kind']}`);
            }
            iterate(v.component.inlines);
        }
    }
    return { interactions };
    function iterate(inlines) {
        for (const v of inlines) {
            if (typeof v === "string")
                continue;
            if (isMooToken(v, "buttonBlank")) {
                handleButtonOption("");
                continue;
            }
            if (hasKind(v, "StyledInline") || hasKind(v, "ClassedInline")) {
                iterate(v.inlines);
            }
            else if (hasKind(v, "ChoiceOption")) {
                handleChoiceOption(v.value);
            }
            else if (hasKind(v, "ButtonOption")) {
                handleButtonOption(v.value);
            }
            else if (hasKind(v, "ShortLingualOption")) {
                interactions.push({
                    index: interactions.length,
                    type: WAML.InteractionType.SHORT_LINGUAL_OPTION,
                    placeholder: v.value
                });
            }
        }
    }
    function handleChoiceOption(value) {
        let group;
        if (ambiguousLowerRomanValues.includes(value) && choiceOptionValues.includes("ii")) {
            group = WAML.ChoiceOptionGroup.LOWER_ROMAN;
        }
        else if (ambiguousUpperRomanValues.includes(value) && choiceOptionValues.includes("II")) {
            group = WAML.ChoiceOptionGroup.UPPER_ROMAN;
        }
        else {
            group = guessChoiceOptionGroup(value);
        }
        if (existingChoiceOptionGroup[group]) {
            existingChoiceOptionGroup[group].values.push(value);
        }
        else {
            interactions.push(existingChoiceOptionGroup[group] = {
                index: interactions.length,
                type: WAML.InteractionType.CHOICE_OPTION,
                group,
                values: [value],
                multipleness: getMultipleness(interactions.length)
            });
        }
    }
    function handleButtonOption(value) {
        // TODO 추후 그룹 이름 지정이 들어가야 할 수도...
        const group = "default";
        if (existingButtonOptionGroup[group]) {
            existingButtonOptionGroup[group].values.push(value);
            return;
        }
        interactions.push(existingButtonOptionGroup[group] = {
            index: interactions.length,
            type: WAML.InteractionType.BUTTON_OPTION,
            group,
            values: [value],
            multipleness: getMultipleness(interactions.length)
        });
    }
    function getMultipleness(index) {
        const chunk = flattenAnswers[index];
        if (!chunk)
            return undefined;
        if (chunk.type === "SINGLE")
            return undefined;
        return chunk.ordered ? "ordered" : "unordered";
    }
}
function getFlattenAnswers(answer) {
    if (answer.type === "COMBINED") {
        return answer.children;
    }
    return [answer];
}
function getChoiceOptionValues(document) {
    var _a;
    const R = [];
    for (const v of document) {
        if (typeof v === "string" || !hasKind(v, "Line"))
            continue;
        if (!hasKind(v.component, "LineComponent"))
            continue;
        if (((_a = v.component.headOption) === null || _a === void 0 ? void 0 : _a.kind) === "ChoiceOption") {
            R.push(v.component.headOption.value);
        }
        iterateForChoiceOptionValues(v.component.inlines);
    }
    return R;
    function iterateForChoiceOptionValues(inlines) {
        for (const v of inlines) {
            if (typeof v === "string")
                continue;
            if (hasKind(v, "StyledInline") || hasKind(v, "ClassedInline"))
                iterateForChoiceOptionValues(v.inlines);
            if (hasKind(v, "ChoiceOption")) {
                R.push(v.value);
            }
        }
    }
}
