@{%
  const moo = require("moo");
  const PREFIXES = [ "#", ">", "|" ];
  const FIGURE_ADDONS = [ "##", "))" ];
  const MEDIUM_TYPES = {
    "i": "image",
    "a": "audio",
    "v": "video"
  };
  const mediumPattern = new RegExp(`!(${Object.keys(MEDIUM_TYPES).join("|")})?(?:\\[(.+?)\\])?\\((.+?)\\)`);

  const textual = {
    prefix: /[#>|](?=\s|$)/,
    identifiable: /[\w가-힣-]/,
    character: /./
  };
  const withoutXML = {
    escaping: { match: /\\./, value: chunk => chunk[1] },
    lineComment: /^\/\/[^\n]+/,
    classOpen: "[[", classClose: "]]",
    blockMathOpen: { match: "$$", push: "blockMath" },
    inlineMathOpen: { match: "$", push: "inlineMath" },

    prefix: textual.prefix,
    longLingualOption: { match: /\{{3}.*?\}{3}/, value: chunk => chunk.slice(3, -3) },
    shortLingualOptionOpen: { match: /{{/, push: "option" },
    buttonBlank: { match: /{[\d,]*\[_{3,}\]}/, value: chunk => (chunk.match(/^{([\d,]*)\[/)[1] || "0").split(',').filter(v => v).map(v => parseInt(v)) },
    buttonOptionOpen: { match: /{[\d,]*\[/, value: chunk => chunk.match(/^{([\d,]*)\[/)[1] || "0", push: "singleButtonOption" },
    choiceOptionOpen: { match: /{/, push: "singleChoiceOption" },
    pairingOptionGroupOpen: { match: /<pog>/ },

    dKVDirective: { match: /@(?:passage|answertype)\b/, value: chunk => chunk.slice(1) },
    dAnswer: { match: "@answer", push: "answer" },
    sStrikethroughOpen: { match: /~~/, push: "sStrikethrough" },
    sUnderlineOpen: { match: /__/, push: "sUnderline" },
    sBoldOpen: { match: /\*\*/, push: "sBold" },
    footnote: "*)",
    anchor: "^>",
    sItalicOpen: { match: /(?<!\\)\*/, push: "sItalic" },
    title: "##",
    caption: "))",

    medium: {
      match: ungroup(mediumPattern),
      value: chunk => {
        const [ , typeKey = "i", title, uri ] = chunk.match(mediumPattern);

        return { type: MEDIUM_TYPES[typeKey], title, uri };
      }
    },
    lineBreak: { match: /\r?\n/, lineBreaks: true },
    spaces: /[ \t]+/,
    hr: { match: /^-{3,}$/ },
    identifiable: textual.identifiable,
    character: textual.character
  };
  const main = {
    xStyleOpen: { match: /<style>\s*/, push: "xStyle", value: () => "style" },
    xExplanationOpen: { match: /<explanation>\s*/, push: "xExplanation", value: () => "explanation" },
    xPOGOpen: { match: /<pog>\s*/, push: "xPOG", value: () => "pog" },
    xTableOpen: { match: /<table/, push: "xTableOpening", value: () => "table" },
    ...withoutXML
  };
  const getCellOpenTokenValue = inline => chunk => {
    return {
      inline,
      prefix: chunk.includes("#") ? "#" : undefined,
      hasAlignmentIndicator: chunk.endsWith(":")
    };
  };
  const lexer = moo.states({
    main,
    xStyle: {
      xStyleClose: { match: /\s*<\/style>/, pop: 1 },
      any: { match: /[\s\S]/, lineBreaks: true }
    },
    xExplanation: {
      xExplanationClose: { match: /\s*<\/explanation>/, pop: 1 },
      xTableOpen: main.xTableOpen,
      ...withoutXML
    },
    xPOG: {
      xPOGClose: { match: /\s*<\/pog>/, pop: 1 },
      ...withoutXML
    },
    xTableOpening: {
      tagClose: { match: />/, next: "xTable" },
      spaces: withoutXML.spaces,
      identifiable: withoutXML.identifiable,
      character: withoutXML.character
    },
    xTable: {
      xTableClose: { match: /\s*<\/table>/, pop: 1 },
      cellOpen: { match: /^\s*#?\[:?/, push: "xTableCell", value: getCellOpenTokenValue(false) },
      inlineCellOpen: { match: /#?\[:?/, push: "xTableCell", value: getCellOpenTokenValue(true) },
      rowSeparator: /={3,}/,
      lineBreak: { match: /\r?\n/, lineBreaks: true },
      spaces: /[ \t]+/
    },
    xTableCell: {
      classClose: main.classClose,
      cellClose: { match: /:?]-*(?:\r?\n\|)*/, lineBreaks: true, pop: 1, value: chunk => {
        const colspan = chunk.split('-').length;
        const rowspan = chunk.split(/\r?\n/).length;

        return {
          hasAlignmentIndicator: chunk.startsWith(":"),
          colspan: colspan > 1 ? colspan : undefined,
          rowspan: rowspan > 1 ? rowspan : undefined
        };
      }},
      ...omit(main, 'classClose')
    },
    answer: {
      pairingNetOpen: { match: /(?<=[\w가-힣]){\s*/, push: "pairingNet" },
      shortLingualOptionOpen: { match: /{{/, push: "option" },
      buttonOptionOpen: { match: /{\[/, push: "objectiveOption" },
      choiceOptionOpen: { match: /{/, push: "objectiveOption" },
      identifiable: textual.identifiable,
      lineBreak: { ...withoutXML.lineBreak, pop: 1 },
      spaces: withoutXML.spaces
    },
    pairingNet: {
      pairingNetItemOpen: { match: /{/, push: "pairingNetItem" },
      arraySeparator: /\s*,\s*/,
      pairingNetClose: { match: /\s*}\s*?/, pop: 1 },
      spaces: withoutXML.spaces
    },
    pairingNetItem: {
      pairingNetItemArrow: /\s*->\s*/,
      pairingNetItemClose: { match: /}/, pop: 1 },
      identifiable: textual.identifiable,
      spaces: withoutXML.spaces
    },
    option: { // 단답형
      escaping: withoutXML.escaping,
      shortLingualOptionClose: { match: /}}/, pop: 1 },
      shortLingualDefaultValue: { match: "=" },
      ...textual
    },
    singleButtonOption: { // @answer 이외
      escaping: withoutXML.escaping,
      buttonOptionClose: { match: /,?]}/, pop: 1 },
      ...textual
    },
    singleChoiceOption: { // @answer 이외
      escaping: withoutXML.escaping,
      pairingSeparator: /\s*(?:->|=>|<-|<=)\s*/,
      choiceOptionClose: { match: /,?}/, pop: 1 },
      ...textual
    },
    objectiveOption: { // @answer 한정
      escaping: withoutXML.escaping,
      buttonOptionClose: { match: /,?]}/, pop: 1 },
      choiceOptionClose: { match: /,?}/, pop: 1 },
      orderedOptionSeparator: /\s*->\s*/,
      unorderedOptionSeparator: /\s*(?<!\\),\s*/,
      ...textual
    },
    blockMath: {
      blockMathClose: { match: "$$", pop: 1 },
      any: { match: /[\s\S]/, lineBreaks: true }
    },
    inlineMath: {
      inlineMathClose: { match: /(?<!\\)\$/, pop: 1 },
      any: { match: /[\s\S]/, lineBreaks: true }
    },
    sBold: {
      sBoldClose: { match: /\*\*/, pop: 1 },
      ...withoutXML
    },
    sItalic: {
      sItalicClose: { match: /(?<!\\)\*/, pop: 1 },
      ...withoutXML
    },
    sStrikethrough: {
      sStrikethroughClose: { match: /~~/, pop: 1 },
      ...withoutXML
    },
    sUnderline: {
      sUnderlineClose: { match: /__/, pop: 1 },
      ...withoutXML
    }
  });

  let buttonOptionCounter = 0;

  function ungroup(pattern){
    return new RegExp(
      pattern.source.replace(/(?<!\\)\((?!\?:)(.+?)(?<!\\)\)/g, "(?:$1)"),
      pattern.flags
    );
  }
  function trimArray(array){
    while(array.length){
      if(typeof array[0] !== "string" || array[0].trim()){
        break;
      }
      array.shift();
    }
    return array;
  }
  function mergeValue(array){
    return array.map(v => v.value).join('');
  }
  function removePrefixes(content, prefixes){
    const pattern = new RegExp(`^${prefixes.map(v => `${v.value}\\s*`)}`);
    
    return content.split('\n').map(v => v.replace(pattern, "")).join('\n');
  }
  function omit(target, ...keys){
    const R = { ...target };

    for(const k of keys) delete R[k];
    return R;
  }
%}
@lexer lexer

Array[X, D]    -> $X ($D $X):*                                          {% ([ first, rest ]) => [ first[0], ...rest.map(v => v[1][0]) ] %}
VoidElement[O, B, C] -> $O $B $C                                        {% ([ open, body ]) => ({ tag: open[0].value, body: body[0] }) %}
Element[O, B, C] -> $O XMLAttribute:* %spaces:? %tagClose $B $C         {% ([ open, attributes,,, body ]) => ({
                                                                          tag: open[0].value,
                                                                          attributes,
                                                                          body: body[0]
                                                                        })%}

Main           -> Array[Line, %lineBreak]                               {% id %}
Line           -> (%prefix %spaces):* LineComponent:?                   {% ([ prefixes, component ]) => {
                                                                          prefixes = prefixes.map(v => v[0]);
                                                                          if(component?.kind === "Math"){
                                                                            component.content = removePrefixes(component.content, prefixes);
                                                                          }
                                                                          return { kind: "Line", prefixes, component };
                                                                        }%}
                  | %prefix (%spaces %prefix):*                         {% ([ first, rest ]) => ({ kind: "Line", prefixes: [ first, ...rest.map(v => v[1]) ], component: null }) %}
                  | %lineComment                                        {% id %}
                  | XMLElement                                          {% id %}
LineComponent  -> BlockMath                                             {% id %}
                  | Directive                                           {% id %}
                  | ClassedBlock                                        {% id %}
                  | FigureAddon                                         {% id %}
                  | %longLingualOption                                  {% id %}
                  | %footnote Inline:+                                  {% ([ , inlines ]) => ({ kind: "Footnote", inlines: trimArray(inlines) }) %}
                  | %anchor Inline:+                                    {% ([ , inlines ]) => ({ kind: "Anchor", inlines: trimArray(inlines) }) %}
                  | %hr                                                 {% id %}
                  | Inline:+                                            {% ([ inlines ], _, reject) => {
                                                                          if(PREFIXES.includes(inlines[0])) return reject;
                                                                          if(FIGURE_ADDONS.includes(inlines[0])) return reject;
                                                                          if(inlines.length === 1 && inlines[0].kind === "ShortLingualOption") return inlines[0];

                                                                          if(inlines[0]?.kind === "ChoiceOption"){
                                                                            return { kind: "LineComponent", headOption: inlines[0], inlines: trimArray(inlines.slice(1)) };
                                                                          }
                                                                          return { kind: "LineComponent", inlines };
                                                                        }%}
FigureAddon    -> (%title | %caption) %spaces Inline:+                  {% ([ [{ type }],, inlines ]) => ({ kind: "FigureAddon", type, inlines: trimArray(inlines) }) %}
Directive      -> %dAnswer %spaces (InlineOption | PairingNet):+        {% ([ ,, options ]) => ({ kind: "Directive", name: "answer", options: options.map(v => v[0]) }) %}
                  | %dKVDirective %spaces Text:+                        {% ([ token,, path ]) => ({ kind: "Directive", name: token.value, value: path.join('') }) %}
Inline         -> InlineOption                                          {% id %}
                  | %buttonBlank                                        {% id %}
                  | %medium                                             {% id %}
                  | %spaces                                             {% ([ token ]) => token.value %}
                  | InlineMath                                          {% id %}
                  | Text                                                {% id %}
                  | StyledInline                                        {% id %}
                  | ClassedInline                                       {% id %}
                  | LineXMLElement                                      {% id %}
Text           -> %identifiable                                         {% ([ token ]) => token.value %}
                  | %title                                              {% ([ token ]) => token.value %}
                  | %caption                                            {% ([ token ]) => token.value %}
                  | %prefix                                             {% ([ token ]) => token.value %}
                  | %character                                          {% ([ token ]) => token.value %}
                  | %escaping                                           {% ([ token ]) => token.value %}
StyledInline   -> %sUnderlineOpen Inline:* %sUnderlineClose             {% ([ , inlines ]) => ({ kind: "StyledInline", style: "underline", inlines }) %}
                  | %sBoldOpen Inline:* %sBoldClose                     {% ([ , inlines ]) => ({ kind: "StyledInline", style: "bold", inlines }) %}
                  | %sItalicOpen Inline:+ %sItalicClose                 {% ([ , inlines ]) => ({ kind: "StyledInline", style: "italic", inlines }) %}
                  | %sStrikethroughOpen Inline:+ %sStrikethroughClose   {% ([ , inlines ]) => ({ kind: "StyledInline", style: "strikethrough", inlines }) %}
ClassedBlock   -> %classOpen %identifiable:+ %classClose                {% ([ , name ]) => ({ kind: "ClassedBlock", name: mergeValue(name) }) %}
ClassedInline  -> %classOpen %identifiable:+ ":" Inline:* %classClose   {% ([ , name,, inlines ]) => ({ kind: "ClassedInline", name: mergeValue(name), inlines: trimArray(inlines) }) %}

XMLElement     -> VoidElement[%xStyleOpen, %any:*, %xStyleClose]        {% ([{ tag, body }]) => ({ kind: "XMLElement", tag, content: mergeValue(body) }) %}
                  | VoidElement[%xExplanationOpen, Main, %xExplanationClose] {% ([{ tag, body }]) => ({ kind: "XMLElement", tag, content: body }) %} 
LineXMLElement -> Element[%xTableOpen, Table, %xTableClose]             {% ([{ tag, attributes, body }]) => ({ kind: "XMLElement", tag, attributes, content: body }) %}
                  | VoidElement[%xPOGOpen, Array[PairingOption, %lineBreak], %xPOGClose] {% ([{ tag, body }]) => ({ kind: "XMLElement", tag, content: body }) %}
XMLAttribute   -> %spaces %identifiable:+ "=" "\"" Text:* "\""          {% ([ , key,,, value ]) => ({ kind: "XMLAttribute", key: mergeValue(key), value: value.join('') }) %}
BlockMath      -> %blockMathOpen %any:+ %blockMathClose                 {% ([ , content ]) => ({ kind: "Math", inline: false, content: mergeValue(content) }) %}
InlineMath     -> %inlineMathOpen %any:+ %inlineMathClose               {% ([ , content ]) => ({ kind: "Math", inline: true, content: mergeValue(content) }) %}

Table          -> TableItem:+                                           {% ([ list ]) => list.filter(v => v) %}
TableItem      -> Cell                                                  {% id %}
                  | %rowSeparator                                       {% id %}
                  | %lineBreak                                          {% () => null %}
                  | %spaces                                             {% () => null %}
Cell           -> (%cellOpen | %inlineCellOpen) Main %cellClose         {% ([ [ open ], body, close ], _, reject) => {
                                                                          let alignment;
                                                                          
                                                                          if(open.value.inline && close.value.rowspan){
                                                                            return reject;
                                                                          }
                                                                          if(open.value.hasAlignmentIndicator){
                                                                            if(close.value.hasAlignmentIndicator){
                                                                              alignment = "center";
                                                                            }else{
                                                                              alignment = "left";
                                                                            }
                                                                          }else if(close.value.hasAlignmentIndicator){
                                                                            alignment = "right";
                                                                          }
                                                                          return {
                                                                            kind: "Cell",
                                                                            prefix: open.value.prefix,
                                                                            alignment,
                                                                            colspan: close.value.colspan,
                                                                            rowspan: close.value.rowspan,
                                                                            body
                                                                          };
                                                                        }%}

InlineOption   -> ChoiceOption                                          {% id %}
                  | ButtonOption                                        {% id %}
                  | ShortLingualOption                                  {% id %}
ChoiceOption   -> %choiceOptionOpen Text:+ OptionRest:? %choiceOptionClose {% ([ , first, rest, close ]) => {
                                                                          const multiple = rest || close.value.startsWith(",");
                                                                          return {
                                                                            kind: "ChoiceOption",
                                                                            value: multiple ? [ first.join(''), ...(rest?.value || []) ] : first.join(''),
                                                                            ordered: multiple ? rest?.kind === "OrderedOptionRest" : undefined
                                                                          };
                                                                        }%}
ButtonOption   -> %buttonOptionOpen Text:+ OptionRest:? %buttonOptionClose {% ([ open, first, rest, close ]) => {
                                                                          const multiple = rest || close.value.startsWith(",");
                                                                          return {
                                                                            kind: "ButtonOption",
                                                                            id: ++buttonOptionCounter,
                                                                            group: open.value.split(',').filter(v => v).map(v => parseInt(v)),
                                                                            value: multiple ? [ first.join(''), ...(rest?.value || []) ] : first.join(''),
                                                                            ordered: multiple ? rest?.kind === "OrderedOptionRest" : undefined
                                                                          };
                                                                        }%}
OptionRest     -> (%orderedOptionSeparator Text:+):+                    {% ([ list ]) => ({ kind: "OrderedOptionRest", value: list.map(v => v[1].join('')) }) %}
                  | (%unorderedOptionSeparator Text:+):+                {% ([ list ]) => ({ kind: "UnorderedOptionRest", value: list.map(v => v[1].join('')) }) %}
PairingOption  -> PairingCell Inline:+                                  {% ([ cell, inlines ]) => ({ kind: "PairingOption", cell, inlines: trimArray(inlines) }) %}
PairingCell    -> %choiceOptionOpen %identifiable:+ (%pairingSeparator %identifiable:+):+ %choiceOptionClose {% ([ , first, rest ], _, reject) => {
                                                                          const inbound = [];
                                                                          const outbound = [];

                                                                          for(const [ separator, names ] of rest){
                                                                            const name = names.join('');

                                                                            switch(separator.value.trim()){
                                                                              case "->": outbound.push({ name, multiple: false }); break;
                                                                              case "=>": outbound.push({ name, multiple: true }); break;
                                                                              case "<-": inbound.push({ name, multiple: false }); break;
                                                                              case "<=": inbound.push({ name, multiple: true }); break;
                                                                              default: reject(); return;
                                                                            }
                                                                          }
                                                                          return { kind: "PairingCell", value: first.join(''), inbound, outbound };
                                                                        }%}
ShortLingualOption -> %shortLingualOptionOpen %shortLingualDefaultValue:? Text:* %shortLingualOptionClose {% ([ , defaultValue, value ]) => ({
                                                                          kind: "ShortLingualOption",
                                                                          value: value.join(''),
                                                                          defaultValue: Boolean(defaultValue)
                                                                        })%}
PairingNet     -> %identifiable:+ %pairingNetOpen Array[PairingNetItem, %arraySeparator] %pairingNetClose {% ([ name,, list ]) => ({
                                                                          kind: "PairingNet",
                                                                          name: name.join(''),
                                                                          list
                                                                        })%}
PairingNetItem -> %pairingNetItemOpen %spaces:? %identifiable:+ %pairingNetItemArrow %identifiable:+ %spaces:? %pairingNetItemClose {% ([ ,, from,, to ]) => ({
                                                                          kind: "PairingNetItem",
                                                                          from: from.join(''),
                                                                          to: to.join('')
                                                                        })%}