import { hasKind, isMooToken } from "./type.js";
export function findReferences(document) {
    const R = [];
    for (const v of document) {
        if (typeof v === "string" || !hasKind(v, "Line"))
            continue;
        if (hasKind(v.component, "Directive") && v.component.name === "passage") {
            R.push(v.component);
        }
        if (hasKind(v.component, "LineComponent")) {
            iterate(v.component.inlines);
        }
    }
    return R;
    function iterate(inlines) {
        for (const v of inlines) {
            if (typeof v === "string")
                continue;
            if (isMooToken(v, "medium"))
                R.push(v);
            else if (hasKind(v, "StyledInline"))
                iterate(v.inlines);
            else if (hasKind(v, "ClassedInline"))
                iterate(v.inlines);
        }
    }
}
