@{%
  const moo = require("moo");
  const PREFIXES = [ "#", ">" ];

  const withoutXML = {
    escaping: { match: /\\./, value: chunk => chunk[1] },
    lineComment: /^\/\/[^\n]+/,
    classOpen: "[[", classClose: "]]",
    blockMathOpen: { match: "$$", push: "blockMath" },
    inlineMathOpen: { match: "$", push: "inlineMath" },

    prefix: PREFIXES,
    longLingualOption: { match: /\{{3}.*?\}{3}/, value: chunk => chunk.slice(3, -3) },
    shortLingualOption: { match: /\{{2}.*?\}{2}/, value: chunk => chunk.slice(2, -2) },
    option: { match: /(?<!\\)\{.+?\}/, value: chunk => chunk.slice(1, -1) },

    dAnswer: "@answer",
    dPassage: "@passage",
    sUnderlineOpen: { match: /__/, push: "sUnderline" },
    sBoldOpen: { match: /\*\*/, push: "sBold" },
    footnote: "*)",
    sItalicOpen: { match: /(?<!\\)\*/, push: "sItalic" },

    medium: {
      match: /!\[.+?\]\(.+?\)/,
      value: chunk => {
        const [ , title, uri ] = chunk.match(/^!\[(.+?)\]\((.+?)\)$/);

        return { title, uri };
      }
    },
    lineBreak: { match: /\r?\n/, lineBreaks: true },
    spaces: /[ \t]+/,
    identifiable: /[\w가-힣-]/,
    character: /./
  };
  const lexer = moo.states({
    main: {
      xStyleOpen: { match: /<style>\s*/, push: "xStyle", value: () => "style" },
      xExplanationOpen: { match: /<explanation>\s*/, push: "xExplanation", value: () => "explanation" },
      ...withoutXML
    },
    xStyle: {
      xStyleClose: { match: /\s*<\/style>/, pop: 1 },
      any: { match: /[\s\S]/, lineBreaks: true }
    },
    xExplanation: {
      xExplanationClose: { match: /\s*<\/explanation>/, pop: 1 },
      ...withoutXML
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
    sUnderline: {
      sUnderlineClose: { match: /__/, pop: 1 },
      ...withoutXML
    }
  });

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
%}
@lexer lexer

Array[X, D]    -> null                                                  {% () => [] %} 
                  | $X ($D $X):*                                        {% ([ first, rest ]) => [ first[0], ...rest.map(v => v[1][0]) ] %}
Element[O, B, C] -> $O $B $C                                            {% ([ open, body ]) => ({ tag: open[0].value, body: body[0] }) %}

Main           -> Array[Line, %lineBreak]                               {% id %}
Line           -> (%prefix %spaces):* LineComponent:?                   {% ([ prefixes, component ]) => {
                                                                          prefixes = prefixes.map(v => v[0]);
                                                                          if(component?.kind === "Math"){
                                                                            component.content = removePrefixes(component.content, prefixes);
                                                                          }
                                                                          return { kind: "Line", prefixes, component };
                                                                        }%}
                  | %prefix (%spaces %prefix):*                         {% ([ first, rest ]) => ({ kind: "Line", prefixes: [ first, ...rest.map(v => v[1]) ] }) %}
                  | %lineComment                                        {% id %}
                  | XMLElement                                          {% id %}
LineComponent  -> BlockMath                                             {% id %}
                  | Directive                                           {% id %}
                  | ClassedBlock                                        {% id %}
                  | %longLingualOption                                  {% id %}
                  | %footnote Inline:+                                  {% ([ , inlines ]) => ({ kind: "Footnote", inlines: trimArray(inlines) }) %}
                  | Inline:+                                            {% ([ inlines ], _, reject) => {
                                                                          if(PREFIXES.includes(inlines[0])) return reject;
                                                                          if(inlines[0]?.type === "option"){
                                                                            return { kind: "LineComponent", headOption: inlines[0], inlines: trimArray(inlines.slice(1)) };
                                                                          }
                                                                          return { kind: "LineComponent", inlines };
                                                                        }%}
Directive      -> %dAnswer %spaces (%option | %shortLingualOption)      {% ([ ,, [ option ] ]) => ({ kind: "Directive", name: "answer", option }) %}
                  | %dPassage %spaces Text:+                            {% ([ ,, path ]) => ({ kind: "Directive", name: "passage", path: path.join('') }) %}
Inline         -> %option                                               {% id %}
                  | %shortLingualOption                                 {% id %}
                  | %medium                                             {% id %}
                  | %spaces                                             {% ([ token ]) => token.value %}
                  | InlineMath                                          {% id %}
                  | Text                                                {% id %}
                  | StyledInline                                        {% id %}
                  | ClassedInline                                       {% id %}
Text           -> %identifiable                                         {% ([ token ]) => token.value %}
                  | %prefix                                             {% ([ token ]) => token.value %}
                  | %character                                          {% ([ token ]) => token.value %}
                  | %escaping                                           {% ([ token ]) => token.value %}
StyledInline   -> %sUnderlineOpen Inline:* %sUnderlineClose             {% ([ , inlines ]) => ({ kind: "StyledInline", style: "underline", inlines }) %}
                  | %sBoldOpen Inline:* %sBoldClose                     {% ([ , inlines ]) => ({ kind: "StyledInline", style: "bold", inlines }) %}
                  | %sItalicOpen Inline:+ %sItalicClose                 {% ([ , inlines ]) => ({ kind: "StyledInline", style: "italic", inlines }) %}
ClassedBlock   -> %classOpen %identifiable:+ %classClose                {% ([ , name ]) => ({ kind: "ClassedBlock", name: mergeValue(name) }) %}
ClassedInline  -> %classOpen %identifiable:+ ":" Inline:+ %classClose   {% ([ , name,, inlines ]) => ({ kind: "ClassedInline", name: mergeValue(name), inlines: trimArray(inlines) }) %}

XMLElement     -> Element[%xStyleOpen, %any:*, %xStyleClose]            {% ([{ tag, body }]) => ({ kind: "XMLElement", tag, content: mergeValue(body) }) %}
                  | Element[%xExplanationOpen, Main, %xExplanationClose] {% ([{ tag, body }]) => ({ kind: "XMLElement", tag, content: body }) %} 
BlockMath      -> %blockMathOpen %any:+ %blockMathClose                 {% ([ , content ]) => ({ kind: "Math", inline: false, content: mergeValue(content) }) %}
InlineMath     -> %inlineMathOpen %any:+ %inlineMathClose               {% ([ , content ]) => ({ kind: "Math", inline: true, content: mergeValue(content) }) %}