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
    sStrikethroughOpen: { match: /~~/, push: "sStrikethrough" },
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
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "Main$macrocall$2", "symbols": ["Line"]},
    {"name": "Main$macrocall$3", "symbols": [(lexer.has("lineBreak") ? {type: "lineBreak"} : lineBreak)]},
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
    {"name": "Line", "symbols": [(lexer.has("prefix") ? {type: "prefix"} : prefix), "Line$ebnf$3"], "postprocess": ([ first, rest ]) => ({ kind: "Line", prefixes: [ first, ...rest.map(v => v[1]) ], component: null })},
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
    {"name": "LineComponent", "symbols": ["LineXMLElement"], "postprocess": id},
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
    {"name": "StyledInline$ebnf$4", "symbols": ["Inline"]},
    {"name": "StyledInline$ebnf$4", "symbols": ["StyledInline$ebnf$4", "Inline"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "StyledInline", "symbols": [(lexer.has("sStrikethroughOpen") ? {type: "sStrikethroughOpen"} : sStrikethroughOpen), "StyledInline$ebnf$4", (lexer.has("sStrikethroughClose") ? {type: "sStrikethroughClose"} : sStrikethroughClose)], "postprocess": ([ , inlines ]) => ({ kind: "StyledInline", style: "strikethrough", inlines })},
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
    {"name": "XMLElement$macrocall$1$ebnf$1", "symbols": [(lexer.has("spaces") ? {type: "spaces"} : spaces)], "postprocess": id},
    {"name": "XMLElement$macrocall$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "XMLElement$macrocall$1", "symbols": ["XMLElement$macrocall$1$ebnf$1", "XMLElement$macrocall$2", "XMLElement$macrocall$3", "XMLElement$macrocall$4"], "postprocess": ([ , open, body ]) => ({ tag: open[0].value, body: body[0] })},
    {"name": "XMLElement", "symbols": ["XMLElement$macrocall$1"], "postprocess": ([{ tag, body }]) => ({ kind: "XMLElement", tag, content: mergeValue(body) })},
    {"name": "XMLElement$macrocall$6", "symbols": [(lexer.has("xExplanationOpen") ? {type: "xExplanationOpen"} : xExplanationOpen)]},
    {"name": "XMLElement$macrocall$7", "symbols": ["Main"]},
    {"name": "XMLElement$macrocall$8", "symbols": [(lexer.has("xExplanationClose") ? {type: "xExplanationClose"} : xExplanationClose)]},
    {"name": "XMLElement$macrocall$5$ebnf$1", "symbols": [(lexer.has("spaces") ? {type: "spaces"} : spaces)], "postprocess": id},
    {"name": "XMLElement$macrocall$5$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "XMLElement$macrocall$5", "symbols": ["XMLElement$macrocall$5$ebnf$1", "XMLElement$macrocall$6", "XMLElement$macrocall$7", "XMLElement$macrocall$8"], "postprocess": ([ , open, body ]) => ({ tag: open[0].value, body: body[0] })},
    {"name": "XMLElement", "symbols": ["XMLElement$macrocall$5"], "postprocess": ([{ tag, body }]) => ({ kind: "XMLElement", tag, content: body })},
    {"name": "LineXMLElement$macrocall$2", "symbols": [(lexer.has("xTableOpen") ? {type: "xTableOpen"} : xTableOpen)]},
    {"name": "LineXMLElement$macrocall$3", "symbols": ["Table"]},
    {"name": "LineXMLElement$macrocall$4", "symbols": [(lexer.has("xTableClose") ? {type: "xTableClose"} : xTableClose)]},
    {"name": "LineXMLElement$macrocall$1$ebnf$1", "symbols": []},
    {"name": "LineXMLElement$macrocall$1$ebnf$1", "symbols": ["LineXMLElement$macrocall$1$ebnf$1", (lexer.has("spaces") ? {type: "spaces"} : spaces)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "LineXMLElement$macrocall$1$ebnf$2", "symbols": []},
    {"name": "LineXMLElement$macrocall$1$ebnf$2", "symbols": ["LineXMLElement$macrocall$1$ebnf$2", "XMLAttribute"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "LineXMLElement$macrocall$1$ebnf$3", "symbols": [(lexer.has("spaces") ? {type: "spaces"} : spaces)], "postprocess": id},
    {"name": "LineXMLElement$macrocall$1$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "LineXMLElement$macrocall$1", "symbols": ["LineXMLElement$macrocall$1$ebnf$1", "LineXMLElement$macrocall$2", "LineXMLElement$macrocall$1$ebnf$2", "LineXMLElement$macrocall$1$ebnf$3", (lexer.has("tagClose") ? {type: "tagClose"} : tagClose), "LineXMLElement$macrocall$3", "LineXMLElement$macrocall$4"], "postprocess":  ([ , open, attributes,,, body ]) => ({
          tag: open[0].value,
          attributes,
          body: body[0]
        })},
    {"name": "LineXMLElement", "symbols": ["LineXMLElement$macrocall$1"], "postprocess": ([{ tag, attributes, body }]) => ({ kind: "XMLElement", tag, attributes, content: body })},
    {"name": "XMLAttribute$ebnf$1", "symbols": [(lexer.has("identifiable") ? {type: "identifiable"} : identifiable)]},
    {"name": "XMLAttribute$ebnf$1", "symbols": ["XMLAttribute$ebnf$1", (lexer.has("identifiable") ? {type: "identifiable"} : identifiable)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "XMLAttribute$ebnf$2", "symbols": []},
    {"name": "XMLAttribute$ebnf$2", "symbols": ["XMLAttribute$ebnf$2", "Text"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "XMLAttribute", "symbols": [(lexer.has("spaces") ? {type: "spaces"} : spaces), "XMLAttribute$ebnf$1", {"literal":"="}, {"literal":"\""}, "XMLAttribute$ebnf$2", {"literal":"\""}], "postprocess": ([ , key,,, value ]) => ({ kind: "XMLAttribute", key: mergeValue(key), value: value.join('') })},
    {"name": "BlockMath$ebnf$1", "symbols": [(lexer.has("any") ? {type: "any"} : any)]},
    {"name": "BlockMath$ebnf$1", "symbols": ["BlockMath$ebnf$1", (lexer.has("any") ? {type: "any"} : any)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "BlockMath", "symbols": [(lexer.has("blockMathOpen") ? {type: "blockMathOpen"} : blockMathOpen), "BlockMath$ebnf$1", (lexer.has("blockMathClose") ? {type: "blockMathClose"} : blockMathClose)], "postprocess": ([ , content ]) => ({ kind: "Math", inline: false, content: mergeValue(content) })},
    {"name": "InlineMath$ebnf$1", "symbols": [(lexer.has("any") ? {type: "any"} : any)]},
    {"name": "InlineMath$ebnf$1", "symbols": ["InlineMath$ebnf$1", (lexer.has("any") ? {type: "any"} : any)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "InlineMath", "symbols": [(lexer.has("inlineMathOpen") ? {type: "inlineMathOpen"} : inlineMathOpen), "InlineMath$ebnf$1", (lexer.has("inlineMathClose") ? {type: "inlineMathClose"} : inlineMathClose)], "postprocess": ([ , content ]) => ({ kind: "Math", inline: true, content: mergeValue(content) })},
    {"name": "Table$ebnf$1", "symbols": ["TableItem"]},
    {"name": "Table$ebnf$1", "symbols": ["Table$ebnf$1", "TableItem"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Table", "symbols": ["Table$ebnf$1"], "postprocess": ([ list ]) => list.filter(v => v)},
    {"name": "TableItem", "symbols": ["Cell"], "postprocess": id},
    {"name": "TableItem", "symbols": [(lexer.has("rowSeparator") ? {type: "rowSeparator"} : rowSeparator)], "postprocess": id},
    {"name": "TableItem", "symbols": [(lexer.has("lineBreak") ? {type: "lineBreak"} : lineBreak)], "postprocess": () => null},
    {"name": "TableItem", "symbols": [(lexer.has("spaces") ? {type: "spaces"} : spaces)], "postprocess": () => null},
    {"name": "Cell$subexpression$1", "symbols": [(lexer.has("cellOpen") ? {type: "cellOpen"} : cellOpen)]},
    {"name": "Cell$subexpression$1", "symbols": [(lexer.has("inlineCellOpen") ? {type: "inlineCellOpen"} : inlineCellOpen)]},
    {"name": "Cell", "symbols": ["Cell$subexpression$1", "Main", (lexer.has("cellClose") ? {type: "cellClose"} : cellClose)], "postprocess":  ([ [ open ], body, close ], _, reject) => {
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
        }}
]
  , ParserStart: "Main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
