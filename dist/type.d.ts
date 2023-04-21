export declare namespace WAML {
    export type Document = Array<Line | XMLElement | MooToken<"lineComment">>;
    export type ParserError = {
        error: true;
        message: string;
        stack?: string[];
    };
    export type Answer = {
        type: "SINGLE";
        by: InlineOption['kind'];
        value: string[];
    } | {
        type: "MULTIPLE";
        by: InlineOption['kind'];
        value: string[];
        ordered: boolean;
    } | {
        type: "COMBINED";
        children: Exclude<Answer, {
            type: "COMBINED";
        }>[];
    };
    export enum LinePrefix {
        QUESTION = "#",
        QUOTATION = ">"
    }
    export type Line = {
        kind: "Line";
        prefixes: Array<MooToken<"prefix">>;
        component: LineComponent;
    };
    export type LineComponent = Math<false> | Directive | ClassedBlock | MooToken<"longLingualOption"> | Footnote | {
        kind: "LineComponent";
        headOption?: ChoiceOption;
        inlines: Inline[];
    } | LineXMLElement | null;
    export type Inline = InlineOption | MooToken<"medium"> | Math<true> | StyledInline | ClassedInline | string;
    export type Options = AnswerFormOf<InlineOption>[];
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
    export type Directive = {
        kind: "Directive";
        name: "answer";
        options: Options;
    } | {
        kind: "Directive";
        name: "passage";
        path: string;
    };
    export type Math<I extends boolean> = {
        kind: "Math";
        inline: I;
        content: string;
    };
    export type XMLElement = {
        kind: "XMLElement";
        tag: "style";
        content: string;
    } | {
        kind: "XMLElement";
        tag: "explanation";
        content: Document;
    };
    export type XMLAttribute = {
        kind: "XMLAttribute";
        key: string;
        value: string;
    };
    export type LineXMLElement = {
        kind: "XMLElement";
        tag: "table";
        attributes: XMLAttribute[];
        content: Array<TableCell | MooToken<'rowSeparator'>>;
    };
    export type TableCell = {
        kind: "Cell";
        prefix?: string;
        rowspan?: number;
        colspan?: number;
        alignment?: "left" | "center" | "right";
        body: Document;
    };
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
    type ObjectiveOption<T extends string> = {
        kind: T;
        value: string;
        ordered: undefined;
    };
    type AnswerFormOf<T extends InlineOption> = T extends ChoiceOption | ButtonOption ? T | (Omit<T, 'value' | 'ordered'> & {
        value: string[];
        ordered: boolean;
    }) : T;
    export {};
}
export declare function isMooToken<T extends WAML.MooTokenType>(value: object, type: T): value is WAML.MooToken<T>;
export declare function hasKind<T extends string>(value: object, kind: T): value is {
    kind: T;
};
