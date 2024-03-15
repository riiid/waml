export declare namespace WAML {
    export enum InteractionType {
        CHOICE_OPTION = 0,
        BUTTON_OPTION = 1,
        SHORT_LINGUAL_OPTION = 2,
        LONG_LINGUAL_OPTION = 3,
        PAIRING_NET = 4
    }
    export enum ChoiceOptionGroup {
        NUMERIC = 0,
        LOWER_ALPHABETIC = 1,
        UPPER_ALPHABETIC = 2,
        HANGEUL_CONSONANTAL = 3,
        HANGEUL_FULL = 4,
        LOWER_ROMAN = 5,
        UPPER_ROMAN = 6
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
    export type Answer = {
        type: "SINGLE";
        value: string[];
    } | {
        type: "MULTIPLE";
        value: string[];
        ordered: boolean;
    } | {
        type: "COMBINED";
        children: Exclude<Answer, {
            type: "COMBINED";
        }>[];
    };
    export type Interaction = {
        index: number;
    } & ({
        type: InteractionType.CHOICE_OPTION;
        group: ChoiceOptionGroup;
        values: string[];
        multipleness?: "ordered" | "unordered";
    } | {
        type: InteractionType.BUTTON_OPTION;
        group: number;
        values: string[];
        multipleness?: "ordered" | "unordered";
    } | {
        type: InteractionType.SHORT_LINGUAL_OPTION;
        placeholder: string;
    } | {
        type: InteractionType.LONG_LINGUAL_OPTION;
        placeholder: string;
    } | {
        type: InteractionType.PAIRING_NET;
        name: string;
        fromValues: string[];
        toValues: string[];
    });
    export enum LinePrefix {
        QUESTION = "#",
        QUOTATION = ">",
        INDENTATION = "|"
    }
    export type Line = {
        kind: "Line";
        prefixes: Array<MooToken<"prefix">>;
        component: LineComponent;
    };
    export type LineComponent = Math<false> | Directive | ClassedBlock | FigureAddon | MooToken<"longLingualOption"> | MooToken<"hr"> | Footnote | Anchor | {
        kind: "LineComponent";
        headOption?: ChoiceOption;
        inlines: Inline[];
    } | ShortLingualOption | null;
    export type Inline = InlineOption | MooToken<"medium"> | Math<true> | StyledInline | ClassedInline | LineXMLElement | string;
    export type Options = Array<AnswerFormOf<InlineOption> | PairingNet>;
    export type InlineOption = ChoiceOption | ButtonOption | ShortLingualOption;
    export type ChoiceOption = ObjectiveOption<"ChoiceOption">;
    export type ButtonOption = ObjectiveOption<"ButtonOption"> & {
        id: number;
        group: number[];
    };
    export type ShortLingualOption = {
        kind: "ShortLingualOption";
        value: string;
        defaultValue: boolean;
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
    export type Directive = {
        kind: "Directive";
        name: "answer";
        options: Options;
    } | {
        kind: "Directive";
        name: "passage";
        value: string;
    } | {
        kind: "Directive";
        name: "answertype";
        value: string;
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
        content: Array<TableCell | MooToken<"rowSeparator">>;
    } | {
        kind: "XMLElement";
        tag: "pog";
        content: PairingOption[];
    } | {
        kind: "XMLElement";
        tag: "cog";
        content: Inline[];
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
            type: "image" | "audio" | "video";
            uri: string;
            alt?: string;
            json: object;
        };
        hr: "---";
        rowSeparator: "===";
        buttonBlank: number[];
    };
    type ObjectiveOption<T extends string> = {
        kind: T;
        value: string;
        ordered: undefined;
    };
    type AnswerFormOf<T extends InlineOption> = T extends ChoiceOption | ButtonOption ? T | (Omit<T, "value" | "ordered"> & {
        value: string[];
        ordered: boolean;
    }) : T;
    type PairingEdge = {
        name: string;
        multiple: boolean;
    };
    export {};
}
