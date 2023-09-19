@{%
  const moo = require("moo");
  const PREFIXES = [ "#", ">", "|" ];
  const FIGURE_ADDONS = [ "##", "))" ];

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
    buttonBlank: { match: /{\[_{3,}\]}/, value: "default" },
    buttonOptionOpen: { match: /{\[/, push: "objectiveOption" },
    choiceOptionOpen: { match: /{/, push: "objectiveOption" },

    dAnswer: "@answer",
    dPassage: "@passage",
    sStrikethroughOpen: { match: /~~/, push: "sStrikethrough" },
    sUnderlineOpen: { match: /__/, push: "sUnderline" },
    sBoldOpen: { match: /\*\*/, push: "sBold" },
    footnote: "*)",
    sItalicOpen: { match: /(?<!\\)\*/, push: "sItalic" },
    title: "##",
    caption: "))",

    medium: {
      match: /!\[.+?\]\(.+?\)/,
      value: chunk => {
        const [ , title, uri ] = chunk.match(/^!\[(.+?)\]\((.+?)\)$/);

        return { title, uri };
      }
    },
    lineBreak: { match: /\r?\n/, lineBreaks: true },
    spaces: /[ \t]+/,
    identifiable: textual.identifiable,
    character: textual.character
  };
  const main = {
    xStyleOpen: { match: /<style>\s*/, push: "xStyle", value: () => "style" },
    xExplanationOpen: { match: /<explanation>\s*/, push: "xExplanation", value: () => "explanation" },
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
    option: {
      escaping: withoutXML.escaping,
      shortLingualOptionClose: { match: /}}/, pop: 1 },
      shortLingualDefaultValue: { match: "=" },
      ...textual
    },
    objectiveOption: {
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
VoidElement[O, B, C] -> %spaces:? $O $B $C                              {% ([ , open, body ]) => ({ tag: open[0].value, body: body[0] }) %}
Element[O, B, C] -> %spaces:* $O XMLAttribute:* %spaces:? %tagClose $B $C {% ([ , open, attributes,,, body ]) => ({
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
                  | Inline:+                                            {% ([ inlines ], _, reject) => {
                                                                          if(PREFIXES.includes(inlines[0])) return reject;
                                                                          if(FIGURE_ADDONS.includes(inlines[0])) return reject;

                                                                          const promotable = inlines[0]?.kind === "ChoiceOption"
                                                                            || (inlines[0]?.kind === "ShortLingualOption" && inlines.length === 1)
                                                                          ;
                                                                          if(promotable){
                                                                            return { kind: "LineComponent", headOption: inlines[0], inlines: trimArray(inlines.slice(1)) };
                                                                          }
                                                                          return { kind: "LineComponent", inlines };
                                                                        }%}
                  | LineXMLElement                                      {% id %}
FigureAddon    -> (%title | %caption) %spaces Inline:+                  {% ([ [{ type }],, inlines ]) => ({ kind: "FigureAddon", type, inlines: trimArray(inlines) }) %}
Directive      -> %dAnswer %spaces InlineOption:+                       {% ([ ,, options ]) => ({ kind: "Directive", name: "answer", options }) %}
                  | %dPassage %spaces Text:+                            {% ([ ,, path ]) => ({ kind: "Directive", name: "passage", path: path.join('') }) %}
Inline         -> InlineOption                                          {% id %}
                  | %buttonBlank                                        {% id %}
                  | %medium                                             {% id %}
                  | %spaces                                             {% ([ token ]) => token.value %}
                  | InlineMath                                          {% id %}
                  | Text                                                {% id %}
                  | StyledInline                                        {% id %}
                  | ClassedInline                                       {% id %}
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
ButtonOption   -> %buttonOptionOpen Text:+ OptionRest:? %buttonOptionClose {% ([ , first, rest, close ]) => {
                                                                          const multiple = rest || close.value.startsWith(",");
                                                                          return {
                                                                            kind: "ButtonOption",
                                                                            id: ++buttonOptionCounter,
                                                                            value: multiple ? [ first.join(''), ...(rest?.value || []) ] : first.join(''),
                                                                            ordered: multiple ? rest?.kind === "OrderedOptionRest" : undefined
                                                                          };
                                                                        }%}
OptionRest     -> (%orderedOptionSeparator Text:+):+                    {% ([ list ]) => ({ kind: "OrderedOptionRest", value: list.map(v => v[1].join('')) }) %}
                  | (%unorderedOptionSeparator Text:+):+                {% ([ list ]) => ({ kind: "UnorderedOptionRest", value: list.map(v => v[1].join('')) }) %}
ShortLingualOption -> %shortLingualOptionOpen %shortLingualDefaultValue:? Text:* %shortLingualOptionClose {% ([ , defaultValue, value ]) => ({
                                                                          kind: "ShortLingualOption",
                                                                          value: value.join(''),
                                                                          defaultValue: Boolean(defaultValue)
                                                                        })%}