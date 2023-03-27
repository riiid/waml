import { hasKind, isMooToken } from "./type.js";
export function sanitizeWAML(document) {
    const R = [];
    iterate(document);
    return R.join('\n');
    function iterate(nodes) {
        const line = [];
        for (const v of nodes) {
            if (typeof v === "string") {
                line.push(v);
                continue;
            }
            if (isMooToken(v, 'lineComment')) {
                continue;
            }
            if (hasKind(v, "XMLElement")) {
                if (v.tag === "explanation") {
                    iterate(v.content);
                }
                continue;
            }
            if (hasKind(v, "Line")) {
                if (v.component === null) {
                    continue;
                }
                if (isMooToken(v.component, 'longLingualOption')) {
                    continue;
                }
                switch (v.component.kind) {
                    case "ClassedBlock": continue;
                    case "Directive":
                        if (v.component.name === "answer" && v.component.option.type === "shortLingualOption") {
                            R.push(v.component.option.value);
                        }
                        continue;
                    case "Footnote":
                    case "LineComponent":
                        iterate(v.component.inlines);
                        continue;
                    case "Math":
                        R.push(v.component.content);
                        continue;
                }
            }
            if (isMooToken(v, 'option') || isMooToken(v, 'shortLingualOption')) {
                continue;
            }
            if (isMooToken(v, 'medium')) {
                R.push(`[${v.value.title}]`);
                continue;
            }
            switch (v.kind) {
                case "ClassedInline":
                case "StyledInline":
                    iterate(v.inlines);
                    continue;
                case "Math":
                    R.push(v.content);
                    continue;
            }
        }
        if (line.length)
            R.push(line.join(''));
    }
}
