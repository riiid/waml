export namespace WAML {
  export type Document = Array<Line | XMLElement | MooToken<"lineComment">>;
  export type ParserError = {
    error: true;
    message: string;
    stack?: string[];
  };

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
        headOption?: MooToken<"option">;
        inlines: Inline[];
      }
    | LineXMLElement
    | null;
  export type Inline =
    | MooToken<"option">
    | MooToken<"shortLingualOption">
    | MooToken<"medium">
    | Math<true>
    | StyledInline
    | ClassedInline
    | string;
  type StyledInline = {
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
  type ClassedInline = {
    kind: "ClassedInline";
    name: string;
    inlines: Inline[];
  };
  export type Directive =
    | {
        kind: "Directive";
        name: "answer";
        option: MooToken<"option">|MooToken<"shortLingualOption">;
      }
    | {
        kind: "Directive";
        name: "passage";
        path: string;
      };
  type Math<I extends boolean> = {
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
  type XMLAttribute = {
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
    option: string;
    shortLingualOption: string;
    longLingualOption: string;
    lineComment: string;
    medium: {
      type: "image";
      title: string;
      url: string;
    };
    rowSeparator: "===";
  };
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