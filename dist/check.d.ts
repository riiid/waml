import { WAML } from "./type.js";
export declare function isMooToken<T extends WAML.MooTokenType>(value: object, type: T): value is WAML.MooToken<T>;
export declare function hasKind<T extends string>(value: object, kind: T): value is {
    kind: T;
};
export declare function guessChoiceOptionGroup(value: string): WAML.ChoiceOptionGroup;
