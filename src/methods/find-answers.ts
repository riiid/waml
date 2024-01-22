import { WAML } from "../type.js";
import { hasKind, guessChoiceOptionGroup, isMooToken } from "../check.js";

type TypedInteraction<T extends WAML.InteractionType> = WAML.Interaction & {
  type: T;
};

const ambiguousLowerRomanValues = ["i", "v", "x"];
const ambiguousUpperRomanValues = ["I", "V", "X"];

export function findAnswers(document: WAML.Document) {
  const R: WAML.Answer[] = [];

  for (const v of document) {
    if (typeof v === "string" || !hasKind(v, "Line")) continue;
    if (!hasKind(v.component, "Directive") || v.component.name !== "answer")
      continue;

    if (v.component.options.length > 1) {
      R.push({
        type: "COMBINED",
        children: v.component.options.map(parse),
      });
    } else {
      R.push(parse(v.component.options[0]));
    }
    function parse(
      option: WAML.Options[number]
    ): Exclude<WAML.Answer, { type: "COMBINED" }> {
      switch (option.kind) {
        case "PairingNet":
          return {
            type: "MULTIPLE",
            ordered: false,
            value: option.list.map(({ from, to }) => `${from}→${to}`),
          };
        case "ShortLingualOption":
          return { type: "SINGLE", value: [option.value] };
        case "ButtonOption":
        case "ChoiceOption":
          if (typeof option.value === "string") {
            return { type: "SINGLE", value: [option.value] };
          }
          // NOTE `@answer {2,1}`이라 적었을 때 학생이 1 -> 2 순으로 답을 내는 경우에도 정답 처리하기 위함
          if (!option.ordered) option.value.sort();
          return {
            type: "MULTIPLE",
            value: option.value,
            ordered: option.ordered,
          };
      }
    }
  }
  return R;
}
export function getAnswerFormat(
  document: WAML.Document,
  answer?: WAML.Answer
): WAML.Metadata["answerFormat"] {
  const flattenAnswers = answer ? getFlattenAnswers(answer) : [];
  const choiceOptionValues = getChoiceOptionValues(document);
  const interactions: WAML.Interaction[] = [];

  const existingChoiceOptionGroup: Record<
    string,
    TypedInteraction<WAML.InteractionType.CHOICE_OPTION>
  > = {};
  const existingButtonOptionGroup: Record<
    string,
    TypedInteraction<WAML.InteractionType.BUTTON_OPTION>
  > = {};
  const existingPairingNetGroup: Record<
    string,
    TypedInteraction<WAML.InteractionType.PAIRING_NET>
  > = {};

  for (const v of document) {
    if (typeof v === "string" || !hasKind(v, "Line")) continue;
    if (hasKind(v.component, "PairingOption")) {
      for (const w of v.component.cell.inbound) {
        const group =
          existingPairingNetGroup[w.name] ||
          (existingPairingNetGroup[w.name] = {
            type: WAML.InteractionType.PAIRING_NET,
            index: interactions.length,
            name: w.name,
            fromValues: [],
            toValues: [],
          });
        if (group.index === interactions.length) interactions.push(group);
        group.toValues.push(v.component.cell.value);
      }
      for (const w of v.component.cell.outbound) {
        const group =
          existingPairingNetGroup[w.name] ||
          (existingPairingNetGroup[w.name] = {
            type: WAML.InteractionType.PAIRING_NET,
            index: interactions.length,
            name: w.name,
            fromValues: [],
            toValues: [],
          });
        if (group.index === interactions.length) interactions.push(group);
        group.fromValues.push(v.component.cell.value);
      }
    } else if (hasKind(v.component, "LineComponent")) {
      switch (v.component.headOption?.kind) {
        case undefined:
          break;
        case "ChoiceOption":
          handleChoiceOption(v.component.headOption.value);
          break;
        case "ShortLingualOption":
          iterate([v.component.headOption]);
          break;
        default:
          throw Error(
            `Unhandled headOption: ${(v.component.headOption as any)["kind"]}`
          );
      }
      iterate(v.component.inlines);
    }
  }
  return { interactions };

  function iterate(inlines: WAML.Inline[]): void {
    for (const v of inlines) {
      if (typeof v === "string") continue;
      if (isMooToken(v, "buttonBlank")) {
        handleButtonOption("");
        continue;
      }
      if (hasKind(v, "StyledInline") || hasKind(v, "ClassedInline")) {
        iterate(v.inlines);
      } else if (hasKind(v, "ChoiceOption")) {
        handleChoiceOption(v.value);
      } else if (hasKind(v, "ButtonOption")) {
        handleButtonOption(v.value);
      } else if (hasKind(v, "ShortLingualOption")) {
        interactions.push({
          index: interactions.length,
          type: WAML.InteractionType.SHORT_LINGUAL_OPTION,
          placeholder: v.value,
        });
      }
    }
  }
  function handleChoiceOption(value: string): void {
    let group: ReturnType<typeof guessChoiceOptionGroup>;

    if (
      ambiguousLowerRomanValues.includes(value) &&
      choiceOptionValues.includes("ii")
    ) {
      group = WAML.ChoiceOptionGroup.LOWER_ROMAN;
    } else if (
      ambiguousUpperRomanValues.includes(value) &&
      choiceOptionValues.includes("II")
    ) {
      group = WAML.ChoiceOptionGroup.UPPER_ROMAN;
    } else {
      group = guessChoiceOptionGroup(value);
    }
    if (existingChoiceOptionGroup[group]) {
      existingChoiceOptionGroup[group].values.push(value);
    } else {
      interactions.push(
        (existingChoiceOptionGroup[group] = {
          index: interactions.length,
          type: WAML.InteractionType.CHOICE_OPTION,
          group,
          values: [value],
          multipleness: getMultipleness(interactions.length),
        })
      );
    }
  }
  function handleButtonOption(value: string): void {
    // TODO 추후 그룹 이름 지정이 들어가야 할 수도...
    const group = "default";

    if (existingButtonOptionGroup[group]) {
      existingButtonOptionGroup[group].values.push(value);
      return;
    }
    interactions.push(
      (existingButtonOptionGroup[group] = {
        index: interactions.length,
        type: WAML.InteractionType.BUTTON_OPTION,
        group,
        values: [value],
        multipleness: getMultipleness(interactions.length),
      })
    );
  }
  function getMultipleness(index: number) {
    const chunk = flattenAnswers[index];
    if (!chunk) return undefined;
    if (chunk.type === "SINGLE") return undefined;
    return chunk.ordered ? "ordered" : "unordered";
  }
}
function getFlattenAnswers(answer: WAML.Answer) {
  if (answer.type === "COMBINED") {
    return answer.children;
  }
  return [answer];
}
function getChoiceOptionValues(document: WAML.Document): string[] {
  const R: string[] = [];

  for (const v of document) {
    if (typeof v === "string" || !hasKind(v, "Line")) continue;
    if (!hasKind(v.component, "LineComponent")) continue;
    if (v.component.headOption?.kind === "ChoiceOption") {
      R.push(v.component.headOption.value);
    }
    iterateForChoiceOptionValues(v.component.inlines);
  }
  return R;

  function iterateForChoiceOptionValues(inlines: WAML.Inline[]): void {
    for (const v of inlines) {
      if (typeof v === "string") continue;
      if (hasKind(v, "StyledInline") || hasKind(v, "ClassedInline"))
        iterateForChoiceOptionValues(v.inlines);
      if (hasKind(v, "ChoiceOption")) {
        R.push(v.value);
      }
    }
  }
}
