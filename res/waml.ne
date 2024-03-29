@{%
  const moo = require("moo");
  const PREFIXES = [ "#", ">", "|" ];
  const FIGURE_ADDONS = [ "##", "))" ];
  const MEDIUM_TYPES = {
    "i": "image",
    "a": "audio",
    "v": "video"
  };
  const mediumPattern = /!(i|a|v)?(?:\[(.+?)\])?\((.+?)\)(\{.+?\})?/;
  const ungroupedMediumPattern = /!(?:i|a|v)?(?:\[(?:.+?)\])?\((?:.+?)\)(?:\{.+?\})?/;

  const escaping = { match: /\\/, push: "escaping" };
  const textual = {
    prefix: /[#>|](?=\s|$)/,
    identifiable: /[\w가-힣-]/,
    character: /./
  };
  const withoutXML = {
    forcedLineBreak: "///",
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
    xTableOpen: { match: /<table/, push: "xTableOpening", value: () => "table" },
    xActionOpen: { match: /<action/, push: "xActionOpening", value: () => "action" },
    inlineKnobOpen: { match: /\(\d*?\(/, push: "inlineKnob", value: chunk => chunk.match(/\((\d*?)\(/)[1] || "0" },
    buttonKnobOpen: { match: /\(\d*?\[/, push: "buttonKnob", value: chunk => chunk.match(/\((\d*?)\[/)[1] || "0" },

    dKVDirective: { match: /@(?:passage|answertype)\b/, value: chunk => chunk.slice(1) },
    dAnswer: { match: "@answer", push: "answer" },
    sStrikethroughOpen: { match: /~~/, push: "sStrikethrough" },
    sUnderlineOpen: { match: /__/, push: "sUnderline" },
    sBoldOpen: { match: /\*\*/, push: "sBold" },
    footnote: "*)",
    anchor: "^>",
    sItalicOpen: { match: /\*/, push: "sItalic" },
    title: "##",
    caption: "))",

    medium: {
      match: ungroupedMediumPattern,
      value: chunk => {
        const [ , typeKey = "i", title, uri, jsonChunk ] = chunk.match(mediumPattern);
        let json = {};

        if(jsonChunk) try{
          json = JSON.parse(jsonChunk);
        }catch(error){
          json = { error: error.toString() };
        }
        return { type: MEDIUM_TYPES[typeKey], title, uri, json };
      }
    },
    lineBreak: { match: /\r?\n/, lineBreaks: true },
    spaces: /[ \t]+/,
    hr: { match: /^-{3,}$/ },
    identifiable: textual.identifiable,
    character: textual.character
  };
  const main = {
    escaping,
    xStyleOpen: { match: /<style>\s*/, push: "xStyle", value: () => "style" },
    xExplanationOpen: { match: /<explanation>\s*/, push: "xExplanation", value: () => "explanation" },
    xPOGOpen: { match: /<pog>\s*/, push: "xPOG", value: () => "pog" },
    xCOGOpen: { match: /<cog>\s*/, push: "xCOG", value: () => "cog" },
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
    escaping: {
      any: { match: /[\s\S]/, lineBreaks: true, pop: 1 }
    },
    xStyle: {
      escaping,
      xStyleClose: { match: /\s*<\/style>/, pop: 1 },
      any: { match: /[\s\S]/, lineBreaks: true }
    },
    xExplanation: {
      escaping,
      xExplanationClose: { match: /\s*<\/explanation>/, pop: 1 },
      xTableOpen: main.xTableOpen,
      ...withoutXML
    },
    xPOG: {
      escaping,
      xPOGClose: { match: /\s*<\/pog>/, pop: 1 },
      ...withoutXML
    },
    xCOG: {
      escaping,
      xCOGClose: { match: /\s*<\/cog>/, pop: 1 },
      ...omit(withoutXML, 'longLingualOption', 'shortLingualOptionOpen', 'buttonBlank', 'buttonOptionOpen')
    },
    xTableOpening: xmlOpening("xTable"),
    xTable: {
      escaping,
      xTableClose: { match: /\s*<\/table>/, pop: 1 },
      cellOpen: { match: /^\s*#?\[:?/, push: "xTableCell", value: getCellOpenTokenValue(false) },
      inlineCellOpen: { match: /#?\[:?/, push: "xTableCell", value: getCellOpenTokenValue(true) },
      rowSeparator: /={3,}/,
      lineBreak: { match: /\r?\n/, lineBreaks: true },
      spaces: /[ \t]+/
    },
    xTableCell: {
      escaping,
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
    xActionOpening: xmlOpening("xAction"),
    xAction: {
      escaping,
      xActionClose: { match: /\s*<\/action>/, pop: 1 },
      actionCondition: [ "onLoad", "onClick" ],
      aPlay: "play ",
      aReplace: { match: /replace /, push: "aReplace" },
      action: [
        { match: /go next/, value: () => ({ command: "go", value: "next" }) },
        { match: /go back/, value: () => ({ command: "go", value: "back" }) },
        { match: /go \d+/, value: chunk => ({ command: "go", value: parseInt(chunk.match(/\d+/)[0]) }) },
        {
          match: [ /set (?:\d+ )?(?:enabled|disabled|activated|inactivated)/ ],
          value: function(chunk){
            const [ , index, value ] = chunk.match(addGroups(this.match[0]));
            
            if(index){
              return { command: "set", index: parseInt(index), value };
            }
            return { command: "set", value };
          }
        },
        { match: /dispatch \w+/, value: chunk => ({ command: "dispatch", value: chunk.slice(9) }) }
      ],
      allSpaces: { match: /[ \t\r\n]+/, lineBreaks: true },
      medium: withoutXML.medium,
      ...textual
    },
    aReplace: {
      escaping,
      comma: { match: /,/, pop: 1 },
      lineBreak: { ...withoutXML.lineBreak, pop: 1 },
      ...textual
    },
    answer: {
      escaping,
      pairingNetOpen: { match: /[\w가-힣]+?{\s*/, push: "pairingNet", value: chunk => chunk.split('{')[0] },
      shortLingualOptionOpen: { match: /{{/, push: "option" },
      buttonOptionOpen: { match: /{\[/, push: "objectiveOption" },
      choiceOptionOpen: { match: /{/, push: "objectiveOption" },
      identifiable: textual.identifiable,
      lineBreak: { ...withoutXML.lineBreak, pop: 1 },
      spaces: withoutXML.spaces
    },
    pairingNet: {
      escaping,
      pairingNetItemOpen: { match: /{/, push: "pairingNetItem" },
      arraySeparator: /\s*,\s*/,
      pairingNetClose: { match: /\s*}\s*?/, pop: 1 },
      spaces: withoutXML.spaces
    },
    pairingNetItem: {
      escaping,
      pairingNetItemArrow: /\s*->\s*/,
      pairingNetItemClose: { match: /}/, pop: 1 },
      identifiable: textual.identifiable,
      spaces: withoutXML.spaces
    },
    option: { // 단답형
      escaping,
      shortLingualOptionClose: { match: /}}/, pop: 1 },
      shortLingualDefaultValue: { match: "=" },
      ...textual
    },
    singleButtonOption: { // @answer 이외
      escaping,
      buttonOptionClose: { match: /,?]}/, pop: 1 },
      ...textual
    },
    singleChoiceOption: { // @answer 이외
      escaping,
      pairingSeparator: /\s*(?:->|=>|<-|<=)\s*/,
      choiceOptionClose: { match: /,?}/, pop: 1 },
      ...textual
    },
    objectiveOption: { // @answer 한정
      escaping,
      buttonOptionClose: { match: /,?]}/, pop: 1 },
      choiceOptionClose: { match: /,?}/, pop: 1 },
      orderedOptionSeparator: /\s*->\s*/,
      unorderedOptionSeparator: /\s*,\s*/,
      ...textual
    },
    inlineKnob: {
      escaping,
      inlineKnobClose: { match: /\)\)/, pop: 1 },
      ...withoutXML
    },
    buttonKnob: {
      escaping,
      buttonKnobClose: { match: /\]\)/, pop: 1 },
      ...withoutXML
    },
    blockMath: {
      blockMathClose: { match: "$$", pop: 1 },
      any: { match: /[\s\S]/, lineBreaks: true }
    },
    inlineMath: {
      inlineMathClose: { match: /\$/, pop: 1 },
      any: { match: /[\s\S]/, lineBreaks: true }
    },
    sBold: {
      escaping,
      sBoldClose: { match: /\*\*/, pop: 1 },
      ...withoutXML
    },
    sItalic: {
      escaping,
      sItalicClose: { match: /\*/, pop: 1 },
      ...withoutXML
    },
    sStrikethrough: {
      escaping,
      sStrikethroughClose: { match: /~~/, pop: 1 },
      ...withoutXML
    },
    sUnderline: {
      escaping,
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
  function addGroups(pattern){
    return new RegExp(pattern.source.replaceAll("(?:", "("), pattern.flags);
  }
  function xmlOpening(next){
    return {
      escaping,
      tagClose: { match: />/, next },
      spaces: withoutXML.spaces,
      identifiable: withoutXML.identifiable,
      character: withoutXML.character
    };
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
                  | %forcedLineBreak                                    {% id %}
                  | InlineMath                                          {% id %}
                  | Text                                                {% id %}
                  | StyledInline                                        {% id %}
                  | ClassedInline                                       {% id %}
                  | LineXMLElement                                      {% id %}
                  | InlineKnob                                          {% id %}
                  | ButtonKnob                                          {% id %}
Text           -> %identifiable                                         {% ([ token ]) => token.value %}
                  | %title                                              {% ([ token ]) => token.value %}
                  | %caption                                            {% ([ token ]) => token.value %}
                  | %prefix                                             {% ([ token ]) => token.value %}
                  | %character                                          {% ([ token ]) => token.value %}
                  | %escaping %any                                      {% ([ , token ]) => token.value %}
StyledInline   -> %sUnderlineOpen Inline:* %sUnderlineClose             {% ([ , inlines ]) => ({ kind: "StyledInline", style: "underline", inlines }) %}
                  | %sBoldOpen Inline:* %sBoldClose                     {% ([ , inlines ]) => ({ kind: "StyledInline", style: "bold", inlines }) %}
                  | %sItalicOpen Inline:+ %sItalicClose                 {% ([ , inlines ]) => ({ kind: "StyledInline", style: "italic", inlines }) %}
                  | %sStrikethroughOpen Inline:+ %sStrikethroughClose   {% ([ , inlines ]) => ({ kind: "StyledInline", style: "strikethrough", inlines }) %}
ClassedBlock   -> %classOpen %identifiable:+ %classClose                {% ([ , name ]) => ({ kind: "ClassedBlock", name: mergeValue(name) }) %}
ClassedInline  -> %classOpen %identifiable:+ ":" Inline:* %classClose   {% ([ , name,, inlines ]) => ({ kind: "ClassedInline", name: mergeValue(name), inlines: trimArray(inlines) }) %}

XMLElement     -> VoidElement[%xStyleOpen, %any:*, %xStyleClose]        {% ([{ tag, body }]) => ({ kind: "XMLElement", tag, content: mergeValue(body) }) %}
                  | VoidElement[%xExplanationOpen, Main, %xExplanationClose] {% ([{ tag, body }]) => ({ kind: "XMLElement", tag, content: body }) %}
                  | Element[%xActionOpen, ActionDefinition:+, %xActionClose] {% ([{ tag, attributes, body }]) => {
                                                                          let index = 0;
                                                                          for(const { key, value } of attributes){
                                                                            if(key !== "for") throw Error(`Unexpected attribute of <action>: ${key}`);
                                                                            index = parseInt(value) || 0;
                                                                          }
                                                                          return { kind: "XMLElement", tag, index, content: body };
                                                                        }%}
LineXMLElement -> Element[%xTableOpen, Table, %xTableClose]             {% ([{ tag, attributes, body }]) => ({ kind: "XMLElement", tag, attributes, content: body }) %}
                  | VoidElement[%xCOGOpen, Inline:+, %xCOGClose]        {% ([{ tag, body }]) => ({ kind: "XMLElement", tag, content: body }) %}
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
PairingNet     -> %pairingNetOpen Array[PairingNetItem, %arraySeparator] %pairingNetClose {% ([ { value: name }, list ]) => ({
                                                                          kind: "PairingNet",
                                                                          name,
                                                                          list
                                                                        })%}
PairingNetItem -> %pairingNetItemOpen %spaces:? %identifiable:+ %pairingNetItemArrow %identifiable:+ %spaces:? %pairingNetItemClose {% ([ ,, from,, to ]) => ({
                                                                          kind: "PairingNetItem",
                                                                          from: from.join(''),
                                                                          to: to.join('')
                                                                        })%}
InlineKnob     -> %inlineKnobOpen Inline:+ %inlineKnobClose             {% ([ { value }, inlines ]) => ({ kind: "InlineKnob", index: parseInt(value), inlines: trimArray(inlines) })%}
ButtonKnob     -> %buttonKnobOpen Inline:+ %buttonKnobClose             {% ([ { value }, inlines ]) => ({ kind: "ButtonKnob", index: parseInt(value), inlines: trimArray(inlines) })%}
ActionDefinition -> %allSpaces:? %actionCondition %allSpaces:? "{" %allSpaces:? Array[Action, %allSpaces:? "," %allSpaces:?] %allSpaces:? "}" %allSpaces:? {% ([ , condition,,,, actions ]) => ({
                                                                          kind: "ActionDefinition",
                                                                          condition,
                                                                          actions
                                                                        })%}
Action         -> %aPlay %medium                                        {% ([ , medium ]) => ({ kind: "Action", command: "play", medium: medium.value }) %}
                  | %aReplace Text:+ %lineBreak:?                       {% ([ , value ]) => ({ kind: "Action", command: "replace", value: value.join('') }) %}
                  | %action                                             {% ([ { value } ]) => ({ kind: "Action", ...value }) %}