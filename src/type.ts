export namespace WAML {
  export enum InteractionType {
    CHOICE_OPTION,
    BUTTON_OPTION,
    SHORT_LINGUAL_OPTION,
    LONG_LINGUAL_OPTION,
    PAIRING_NET,
  }
  // 0부터는 <cog>에 의해 자동 설정된 값들이 들어갑니다.
  export enum ChoiceOptionGroup {
    NUMERIC = -7,
    LOWER_ALPHABETIC,
    UPPER_ALPHABETIC,
    HANGEUL_CONSONANTAL,
    HANGEUL_FULL,
    LOWER_ROMAN,
    UPPER_ROMAN,
  }

  export type Document = Array<Line | XMLElement | MooToken<"lineComment">>;
  export type ParserError = {
    error: true;
    message: string;
    stack?: string[];
  };
  export type Metadata = {
    answerFormat: {
      interactions: Interaction[];
    };
    answers: Answer[];
  };
  export type Answer =
    // NOTE Single-valued answer's value type is also an array for Backend friendliness.
    | {
        type: "SINGLE";
        value: string[];
      }
    | {
        type: "MULTIPLE";
        value: string[];
        ordered: boolean;
      }
    | {
        type: "COMBINED";
        children: Exclude<Answer, { type: "COMBINED" }>[];
      };
  export type Interaction = {
    index: number;
  } & (
    | {
        type: InteractionType.CHOICE_OPTION;
        group: ChoiceOptionGroup;
        values: string[];
        multipleness?: "ordered" | "unordered";
      }
    | {
        type: InteractionType.BUTTON_OPTION;
        group: number;
        values: string[];
        multipleness?: "ordered" | "unordered";
      }
    | {
        type: InteractionType.SHORT_LINGUAL_OPTION;
        placeholder: string;
      }
    | {
        type: InteractionType.LONG_LINGUAL_OPTION;
        placeholder: string;
      }
    | {
        type: InteractionType.PAIRING_NET;
        name: string;
        fromValues: string[];
        toValues: string[];
      }
  );

  export enum LinePrefix {
    QUESTION = "#",
    QUOTATION = ">",
    INDENTATION = "|",
  }
  export type Line = {
    kind: "Line";
    prefixes: Array<MooToken<"prefix">>;
    component: LineComponent;
  };
  export type LineComponent =
    | Math<false>
    | Directive
    | ClassedBlock
    | FigureAddon
    | MooToken<"longLingualOption">
    | MooToken<"hr">
    | Footnote
    | Anchor
    | {
        kind: "LineComponent";
        headOption?: ChoiceOption;
        inlines: Inline[];
      }
    | ShortLingualOption
    | null;
  export type Inline =
    | InlineOption
    | InlineKnob
    | ButtonKnob
    | MooToken<"medium">
    | Math<true>
    | StyledInline
    | ClassedInline
    | LineXMLElement
    | string;
  export type Options = Array<AnswerFormOf<InlineOption> | PairingNet>;
  export type InlineOption = ChoiceOption | ButtonOption | ShortLingualOption;
  export type ChoiceOption = ObjectiveOption<"ChoiceOption"> & {
    group: number;
  };
  export type ButtonOption = ObjectiveOption<"ButtonOption"> & {
    id: number; // NOTE 같은 보기가 여럿 있을 수도 있기 때문
    group: number[];
  };
  export type ShortLingualOption = {
    kind: "ShortLingualOption";
    value: string;
    defaultValue: boolean;
  };
  export type InlineKnob = {
    kind: "InlineKnob";
    index: number;
    inlines: Inline[];
  };
  export type ButtonKnob = {
    kind: "ButtonKnob";
    index: number;
    inlines: Inline[];
  };
  export type StyledInline = {
    kind: "StyledInline";
    style: "underline" | "bold" | "italic" | "strikethrough";
    inlines: Inline[];
  };
  export type Footnote = {
    kind: "Footnote";
    inlines: Inline[];
  };
  export type Anchor = {
    kind: "Anchor";
    inlines: Inline[];
  };
  export type FigureAddon = {
    kind: "FigureAddon";
    type: "title" | "caption";
    inlines: Inline[];
  };
  export type PairingOption = {
    kind: "PairingOption";
    cell: PairingCell;
    inlines: Inline[];
  };
  export type PairingCell = {
    kind: "PairingCell";
    value: string;
    inbound: PairingEdge[];
    outbound: PairingEdge[];
  };
  export type PairingNet = {
    kind: "PairingNet";
    name: string;
    list: PairingNetItem[];
  };
  export type PairingNetItem = {
    kind: "PairingNetItem";
    from: string;
    to: string;
  };
  export type ClassedBlock = {
    kind: "ClassedBlock";
    name: string;
  };
  export type ClassedInline = {
    kind: "ClassedInline";
    name: string;
    inlines: Inline[];
  };
  export type Directive =
    | {
        kind: "Directive";
        name: "answer";
        options: Options;
      }
    | {
        kind: "Directive";
        name: "passage";
        value: string;
      }
    | {
        kind: "Directive";
        name: "answertype";
        value: string;
      };
  export type Math<I extends boolean> = {
    kind: "Math";
    inline: I;
    content: string;
  };
  export type XMLElement =
    | {
        kind: "XMLElement";
        tag: "style";
        content: string;
      }
    | {
        kind: "XMLElement";
        tag: "explanation";
        content: Document;
      }
    | {
        kind: "XMLElement";
        tag: "action";
        index: number;
        content: ActionDefinition[];
      };
  export type XMLAttribute = {
    kind: "XMLAttribute";
    key: string;
    value: string;
  };
  export type ActionDefinition = {
    condition: MooToken<"actionCondition">;
    actions: Action[];
  };
  export type LineXMLElement =
    | {
        kind: "XMLElement";
        tag: "table";
        attributes: XMLAttribute[];
        content: Array<TableCell | MooToken<"rowSeparator">>;
      }
    | { kind: "XMLElement"; tag: "pog"; content: PairingOption[] }
    | { kind: "XMLElement"; tag: "cog"; content: Inline[] };
  export type Action = {
    kind: "Action";
  } & (
    | {
        command: "go";
        value: "next" | "back" | number;
      }
    | {
        command: "play";
        medium: MooTokenValueTable["medium"];
      }
    | {
        command: "replace";
        value: string;
      }
    | {
        command: "set";
        index?: number;
        value: "enabled" | "disabled" | "activated" | "inactivated";
      }
    | {
        command: "dispatch";
        value: string;
      }
  );
  export type TableCell = {
    kind: "Cell";
    prefix?: string;
    rowspan?: number;
    colspan?: number;
    alignment?: "left" | "center" | "right";
    body: Document;
  };

  export type TypedXMLElement<T extends string> = (
    | XMLElement
    | LineXMLElement
  ) & { tag: T };
  // eslint-disable-next-line @jjoriping/no-type-name-affix
  export type MooTokenType = keyof MooTokenValueTable;
  export type MooToken<T extends MooTokenType> = {
    type: T;
    value: MooTokenValueTable[T];
    text: string;
    offset: number;
    lineBreaks: number;
    line: number;
    col: number;
  };
  type MooTokenValueTable = {
    prefix: string;
    longLingualOption: string;
    lineComment: string;
    medium: {
      type: "image" | "audio" | "video";
      uri: string;
      alt?: string;
      json: object;
    };
    hr: "---";
    rowSeparator: "===";
    buttonBlank: number[];
    actionCondition: "onLoad" | "onClick";
  };

  type ObjectiveOption<T extends string> = {
    kind: T;
    value: string;
    ordered: undefined;
  };
  type AnswerFormOf<T extends InlineOption> = T extends
    | ChoiceOption
    | ButtonOption
    ? T | (Omit<T, "value" | "ordered"> & { value: string[]; ordered: boolean })
    : T;
  type PairingEdge = { name: string; multiple: boolean };
}
