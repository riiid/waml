// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

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
        const [ , title, url ] = chunk.match(/^!\[(.+?)\]\((.+?)\)$/);

        return { type: "image", title, url };
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
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "Main$macrocall$2", "symbols": ["Line"]},
    {"name": "Main$macrocall$3", "symbols": [(lexer.has("lineBreak") ? {type: "lineBreak"} : lineBreak)]},
    {"name": "Main$macrocall$1", "symbols": [], "postprocess": () => []},
    {"name": "Main$macrocall$1$ebnf$1", "symbols": []},
    {"name": "Main$macrocall$1$ebnf$1$subexpression$1", "symbols": ["Main$macrocall$3", "Main$macrocall$2"]},
    {"name": "Main$macrocall$1$ebnf$1", "symbols": ["Main$macrocall$1$ebnf$1", "Main$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Main$macrocall$1", "symbols": ["Main$macrocall$2", "Main$macrocall$1$ebnf$1"], "postprocess": ([ first, rest ]) => [ first[0], ...rest.map(v => v[1][0]) ]},
    {"name": "Main", "symbols": ["Main$macrocall$1"], "postprocess": id},
    {"name": "Line$ebnf$1", "symbols": []},
    {"name": "Line$ebnf$1$subexpression$1", "symbols": [(lexer.has("prefix") ? {type: "prefix"} : prefix), (lexer.has("spaces") ? {type: "spaces"} : spaces)]},
    {"name": "Line$ebnf$1", "symbols": ["Line$ebnf$1", "Line$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Line$ebnf$2", "symbols": ["LineComponent"], "postprocess": id},
    {"name": "Line$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "Line", "symbols": ["Line$ebnf$1", "Line$ebnf$2"], "postprocess":  ([ prefixes, component ]) => {
          prefixes = prefixes.map(v => v[0]);
          if(component?.kind === "Math"){
            component.content = removePrefixes(component.content, prefixes);
          }
          return { kind: "Line", prefixes, component };
        }},
    {"name": "Line$ebnf$3", "symbols": []},
    {"name": "Line$ebnf$3$subexpression$1", "symbols": [(lexer.has("spaces") ? {type: "spaces"} : spaces), (lexer.has("prefix") ? {type: "prefix"} : prefix)]},
    {"name": "Line$ebnf$3", "symbols": ["Line$ebnf$3", "Line$ebnf$3$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Line", "symbols": [(lexer.has("prefix") ? {type: "prefix"} : prefix), "Line$ebnf$3"], "postprocess": ([ first, rest ]) => ({ kind: "Line", prefixes: [ first, ...rest.map(v => v[1]) ] })},
    {"name": "Line", "symbols": [(lexer.has("lineComment") ? {type: "lineComment"} : lineComment)], "postprocess": id},
    {"name": "Line", "symbols": ["XMLElement"], "postprocess": id},
    {"name": "LineComponent", "symbols": ["BlockMath"], "postprocess": id},
    {"name": "LineComponent", "symbols": ["Directive"], "postprocess": id},
    {"name": "LineComponent", "symbols": ["ClassedBlock"], "postprocess": id},
    {"name": "LineComponent", "symbols": [(lexer.has("longLingualOption") ? {type: "longLingualOption"} : longLingualOption)], "postprocess": id},
    {"name": "LineComponent$ebnf$1", "symbols": ["Inline"]},
    {"name": "LineComponent$ebnf$1", "symbols": ["LineComponent$ebnf$1", "Inline"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "LineComponent", "symbols": [(lexer.has("footnote") ? {type: "footnote"} : footnote), "LineComponent$ebnf$1"], "postprocess": ([ , inlines ]) => ({ kind: "Footnote", inlines: trimArray(inlines) })},
    {"name": "LineComponent$ebnf$2", "symbols": ["Inline"]},
    {"name": "LineComponent$ebnf$2", "symbols": ["LineComponent$ebnf$2", "Inline"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "LineComponent", "symbols": ["LineComponent$ebnf$2"], "postprocess":  ([ inlines ], _, reject) => {
          if(PREFIXES.includes(inlines[0])) return reject;
          if(inlines[0]?.type === "option"){
            return { kind: "LineComponent", headOption: inlines[0], inlines: trimArray(inlines.slice(1)) };
          }
          return { kind: "LineComponent", inlines };
        }},
    {"name": "Directive$subexpression$1", "symbols": [(lexer.has("option") ? {type: "option"} : option)]},
    {"name": "Directive$subexpression$1", "symbols": [(lexer.has("shortLingualOption") ? {type: "shortLingualOption"} : shortLingualOption)]},
    {"name": "Directive", "symbols": [(lexer.has("dAnswer") ? {type: "dAnswer"} : dAnswer), (lexer.has("spaces") ? {type: "spaces"} : spaces), "Directive$subexpression$1"], "postprocess": ([ ,, [ option ] ]) => ({ kind: "Directive", name: "answer", option })},
    {"name": "Directive$ebnf$1", "symbols": ["Text"]},
    {"name": "Directive$ebnf$1", "symbols": ["Directive$ebnf$1", "Text"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Directive", "symbols": [(lexer.has("dPassage") ? {type: "dPassage"} : dPassage), (lexer.has("spaces") ? {type: "spaces"} : spaces), "Directive$ebnf$1"], "postprocess": ([ ,, path ]) => ({ kind: "Directive", name: "passage", path: path.join('') })},
    {"name": "Inline", "symbols": [(lexer.has("option") ? {type: "option"} : option)], "postprocess": id},
    {"name": "Inline", "symbols": [(lexer.has("shortLingualOption") ? {type: "shortLingualOption"} : shortLingualOption)], "postprocess": id},
    {"name": "Inline", "symbols": [(lexer.has("medium") ? {type: "medium"} : medium)], "postprocess": id},
    {"name": "Inline", "symbols": [(lexer.has("spaces") ? {type: "spaces"} : spaces)], "postprocess": ([ token ]) => token.value},
    {"name": "Inline", "symbols": ["InlineMath"], "postprocess": id},
    {"name": "Inline", "symbols": ["Text"], "postprocess": id},
    {"name": "Inline", "symbols": ["StyledInline"], "postprocess": id},
    {"name": "Inline", "symbols": ["ClassedInline"], "postprocess": id},
    {"name": "Text", "symbols": [(lexer.has("identifiable") ? {type: "identifiable"} : identifiable)], "postprocess": ([ token ]) => token.value},
    {"name": "Text", "symbols": [(lexer.has("prefix") ? {type: "prefix"} : prefix)], "postprocess": ([ token ]) => token.value},
    {"name": "Text", "symbols": [(lexer.has("character") ? {type: "character"} : character)], "postprocess": ([ token ]) => token.value},
    {"name": "Text", "symbols": [(lexer.has("escaping") ? {type: "escaping"} : escaping)], "postprocess": ([ token ]) => token.value},
    {"name": "StyledInline$ebnf$1", "symbols": []},
    {"name": "StyledInline$ebnf$1", "symbols": ["StyledInline$ebnf$1", "Inline"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "StyledInline", "symbols": [(lexer.has("sUnderlineOpen") ? {type: "sUnderlineOpen"} : sUnderlineOpen), "StyledInline$ebnf$1", (lexer.has("sUnderlineClose") ? {type: "sUnderlineClose"} : sUnderlineClose)], "postprocess": ([ , inlines ]) => ({ kind: "StyledInline", style: "underline", inlines })},
    {"name": "StyledInline$ebnf$2", "symbols": []},
    {"name": "StyledInline$ebnf$2", "symbols": ["StyledInline$ebnf$2", "Inline"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "StyledInline", "symbols": [(lexer.has("sBoldOpen") ? {type: "sBoldOpen"} : sBoldOpen), "StyledInline$ebnf$2", (lexer.has("sBoldClose") ? {type: "sBoldClose"} : sBoldClose)], "postprocess": ([ , inlines ]) => ({ kind: "StyledInline", style: "bold", inlines })},
    {"name": "StyledInline$ebnf$3", "symbols": ["Inline"]},
    {"name": "StyledInline$ebnf$3", "symbols": ["StyledInline$ebnf$3", "Inline"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "StyledInline", "symbols": [(lexer.has("sItalicOpen") ? {type: "sItalicOpen"} : sItalicOpen), "StyledInline$ebnf$3", (lexer.has("sItalicClose") ? {type: "sItalicClose"} : sItalicClose)], "postprocess": ([ , inlines ]) => ({ kind: "StyledInline", style: "italic", inlines })},
    {"name": "ClassedBlock$ebnf$1", "symbols": [(lexer.has("identifiable") ? {type: "identifiable"} : identifiable)]},
    {"name": "ClassedBlock$ebnf$1", "symbols": ["ClassedBlock$ebnf$1", (lexer.has("identifiable") ? {type: "identifiable"} : identifiable)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "ClassedBlock", "symbols": [(lexer.has("classOpen") ? {type: "classOpen"} : classOpen), "ClassedBlock$ebnf$1", (lexer.has("classClose") ? {type: "classClose"} : classClose)], "postprocess": ([ , name ]) => ({ kind: "ClassedBlock", name: mergeValue(name) })},
    {"name": "ClassedInline$ebnf$1", "symbols": [(lexer.has("identifiable") ? {type: "identifiable"} : identifiable)]},
    {"name": "ClassedInline$ebnf$1", "symbols": ["ClassedInline$ebnf$1", (lexer.has("identifiable") ? {type: "identifiable"} : identifiable)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "ClassedInline$ebnf$2", "symbols": ["Inline"]},
    {"name": "ClassedInline$ebnf$2", "symbols": ["ClassedInline$ebnf$2", "Inline"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "ClassedInline", "symbols": [(lexer.has("classOpen") ? {type: "classOpen"} : classOpen), "ClassedInline$ebnf$1", {"literal":":"}, "ClassedInline$ebnf$2", (lexer.has("classClose") ? {type: "classClose"} : classClose)], "postprocess": ([ , name,, inlines ]) => ({ kind: "ClassedInline", name: mergeValue(name), inlines: trimArray(inlines) })},
    {"name": "XMLElement$macrocall$2", "symbols": [(lexer.has("xStyleOpen") ? {type: "xStyleOpen"} : xStyleOpen)]},
    {"name": "XMLElement$macrocall$3$ebnf$1", "symbols": []},
    {"name": "XMLElement$macrocall$3$ebnf$1", "symbols": ["XMLElement$macrocall$3$ebnf$1", (lexer.has("any") ? {type: "any"} : any)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "XMLElement$macrocall$3", "symbols": ["XMLElement$macrocall$3$ebnf$1"]},
    {"name": "XMLElement$macrocall$4", "symbols": [(lexer.has("xStyleClose") ? {type: "xStyleClose"} : xStyleClose)]},
    {"name": "XMLElement$macrocall$1", "symbols": ["XMLElement$macrocall$2", "XMLElement$macrocall$3", "XMLElement$macrocall$4"], "postprocess": ([ open, body ]) => ({ tag: open[0].value, body: body[0] })},
    {"name": "XMLElement", "symbols": ["XMLElement$macrocall$1"], "postprocess": ([{ tag, body }]) => ({ kind: "XMLElement", tag, content: mergeValue(body) })},
    {"name": "XMLElement$macrocall$6", "symbols": [(lexer.has("xExplanationOpen") ? {type: "xExplanationOpen"} : xExplanationOpen)]},
    {"name": "XMLElement$macrocall$7", "symbols": ["Main"]},
    {"name": "XMLElement$macrocall$8", "symbols": [(lexer.has("xExplanationClose") ? {type: "xExplanationClose"} : xExplanationClose)]},
    {"name": "XMLElement$macrocall$5", "symbols": ["XMLElement$macrocall$6", "XMLElement$macrocall$7", "XMLElement$macrocall$8"], "postprocess": ([ open, body ]) => ({ tag: open[0].value, body: body[0] })},
    {"name": "XMLElement", "symbols": ["XMLElement$macrocall$5"], "postprocess": ([{ tag, body }]) => ({ kind: "XMLElement", tag, content: body })},
    {"name": "BlockMath$ebnf$1", "symbols": [(lexer.has("any") ? {type: "any"} : any)]},
    {"name": "BlockMath$ebnf$1", "symbols": ["BlockMath$ebnf$1", (lexer.has("any") ? {type: "any"} : any)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "BlockMath", "symbols": [(lexer.has("blockMathOpen") ? {type: "blockMathOpen"} : blockMathOpen), "BlockMath$ebnf$1", (lexer.has("blockMathClose") ? {type: "blockMathClose"} : blockMathClose)], "postprocess": ([ , content ]) => ({ kind: "Math", inline: false, content: mergeValue(content) })},
    {"name": "InlineMath$ebnf$1", "symbols": [(lexer.has("any") ? {type: "any"} : any)]},
    {"name": "InlineMath$ebnf$1", "symbols": ["InlineMath$ebnf$1", (lexer.has("any") ? {type: "any"} : any)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "InlineMath", "symbols": [(lexer.has("inlineMathOpen") ? {type: "inlineMathOpen"} : inlineMathOpen), "InlineMath$ebnf$1", (lexer.has("inlineMathClose") ? {type: "inlineMathClose"} : inlineMathClose)], "postprocess": ([ , content ]) => ({ kind: "Math", inline: true, content: mergeValue(content) })}
]
  , ParserStart: "Main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
