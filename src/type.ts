export namespace WAML {
  export type Document = Array<Line | XMLElement | MooToken<"lineComment">>;
  export type ParserError = {
    error: true;
    message: string;
    stack?: string[];
  };
  export type Answer = 
    | {
        type: "Single";
        value: string;
      }
    | {
        type: "Multiple";
        value: string[];
        ordered: boolean;
      }
    | {
        type: "Combined";
        children: Exclude<Answer, { type: "Combined" }>[]
      }
  ;

  export enum LinePrefix {
    QUESTION = "#",
    QUOTATION = ">",
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
    | MooToken<"longLingualOption">
    | Footnote
    | {
        kind: "LineComponent";
        headOption?: SingleValued<ChoiceOption>;
        inlines: Inline[];
      }
    | LineXMLElement
    | null;
  export type Inline =
    | SingleValued<InlineOption>
    | MooToken<"medium">
    | Math<true>
    | StyledInline
    | ClassedInline
    | string;
  export type InlineOption = ChoiceOption | ButtonOption | ShortLingualOption;
  export type ChoiceOption = ObjectiveOption<"ChoiceOption">;
  export type ButtonOption = ObjectiveOption<"ButtonOption">;
  export type ShortLingualOption = {
    kind: "ShortLingualOption";
    value: string;
  };
  export type StyledInline = {
    kind: "StyledInline";
    style: string;
    inlines: Inline[];
  };
  export type Footnote = {
    kind: "Footnote";
    inlines: Inline[];
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
        options: InlineOption[];
      }
    | {
        kind: "Directive";
        name: "passage";
        path: string;
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
  ;
  export type XMLAttribute = {
    kind: "XMLAttribute",
    key: string,
    value: string
  };
  export type LineXMLElement = {
    kind: "XMLElement";
    tag: "table";
    attributes: XMLAttribute[];
    content: Array<TableCell|MooToken<'rowSeparator'>>;
  };
  export type TableCell = {
    kind: "Cell";
    prefix?: string;
    rowspan?: number;
    colspan?: number;
    alignment?: "left"|"center"|"right";
    body: Document;
  }

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
      type: "image";
      title: string;
      url: string;
    };
    rowSeparator: "===";
  };

  type ObjectiveOption<T extends string> = 
    | {
        kind: T;
        value: string;
        ordered: undefined;
      }
    | {
        kind: T;
        value: string[];
        ordered: boolean;
      }
  ;
  type SingleValued<T extends InlineOption> = T & { value: string };
}

export function isMooToken<T extends WAML.MooTokenType>(
  value: object,
  type: T
): value is WAML.MooToken<T> {
  return value && "type" in value && value.type === type && "line" in value && "col" in value;
}
export function hasKind<T extends string>(value:object, kind:T):value is { kind: T }{
  return value && 'kind' in value && value.kind === kind;
}