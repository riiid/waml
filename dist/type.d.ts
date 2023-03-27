export declare namespace WAML {
    export type Document = Array<Line | XMLElement | MooToken<"lineComment">>;
    export type ParserError = {
        error: true;
        message: string;
        stack?: string[];
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
        headOption?: MooToken<"option">;
        inlines: Inline[];
    } | null;
    export type Inline = MooToken<"option"> | MooToken<"shortLingualOption"> | MooToken<"medium"> | Math<true> | StyledInline | ClassedInline | string;
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
    export type Directive = {
        kind: "Directive";
        name: "answer";
        option: MooToken<"option"> | MooToken<"shortLingualOption">;
    } | {
        kind: "Directive";
        name: "passage";
        path: string;
    };
    type Math<I extends boolean> = {
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
    };
    export {};
}
export declare function isMooToken<T extends WAML.MooTokenType>(value: object, type: T): value is WAML.MooToken<T>;
export declare function hasKind<T extends string>(value: object, kind: T): value is {
    kind: T;
};
