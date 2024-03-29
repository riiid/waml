// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

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
    {"name": "LineComponent", "symbols": ["FigureAddon"], "postprocess": id},
    {"name": "LineComponent", "symbols": [(lexer.has("longLingualOption") ? {type: "longLingualOption"} : longLingualOption)], "postprocess": id},
    {"name": "LineComponent$ebnf$1", "symbols": ["Inline"]},
    {"name": "LineComponent$ebnf$1", "symbols": ["LineComponent$ebnf$1", "Inline"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "LineComponent", "symbols": [(lexer.has("footnote") ? {type: "footnote"} : footnote), "LineComponent$ebnf$1"], "postprocess": ([ , inlines ]) => ({ kind: "Footnote", inlines: trimArray(inlines) })},
    {"name": "LineComponent$ebnf$2", "symbols": ["Inline"]},
    {"name": "LineComponent$ebnf$2", "symbols": ["LineComponent$ebnf$2", "Inline"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "LineComponent", "symbols": [(lexer.has("anchor") ? {type: "anchor"} : anchor), "LineComponent$ebnf$2"], "postprocess": ([ , inlines ]) => ({ kind: "Anchor", inlines: trimArray(inlines) })},
    {"name": "LineComponent", "symbols": [(lexer.has("hr") ? {type: "hr"} : hr)], "postprocess": id},
    {"name": "LineComponent$ebnf$3", "symbols": ["Inline"]},
    {"name": "LineComponent$ebnf$3", "symbols": ["LineComponent$ebnf$3", "Inline"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "LineComponent", "symbols": ["LineComponent$ebnf$3"], "postprocess":  ([ inlines ], _, reject) => {
          if(PREFIXES.includes(inlines[0])) return reject;
          if(FIGURE_ADDONS.includes(inlines[0])) return reject;
          if(inlines.length === 1 && inlines[0].kind === "ShortLingualOption") return inlines[0];
        
          if(inlines[0]?.kind === "ChoiceOption"){
            return { kind: "LineComponent", headOption: inlines[0], inlines: trimArray(inlines.slice(1)) };
          }
          return { kind: "LineComponent", inlines };
        }},
    {"name": "FigureAddon$subexpression$1", "symbols": [(lexer.has("title") ? {type: "title"} : title)]},
    {"name": "FigureAddon$subexpression$1", "symbols": [(lexer.has("caption") ? {type: "caption"} : caption)]},
    {"name": "FigureAddon$ebnf$1", "symbols": ["Inline"]},
    {"name": "FigureAddon$ebnf$1", "symbols": ["FigureAddon$ebnf$1", "Inline"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "FigureAddon", "symbols": ["FigureAddon$subexpression$1", (lexer.has("spaces") ? {type: "spaces"} : spaces), "FigureAddon$ebnf$1"], "postprocess": ([ [{ type }],, inlines ]) => ({ kind: "FigureAddon", type, inlines: trimArray(inlines) })},
    {"name": "Directive$ebnf$1$subexpression$1", "symbols": ["InlineOption"]},
    {"name": "Directive$ebnf$1$subexpression$1", "symbols": ["PairingNet"]},
    {"name": "Directive$ebnf$1", "symbols": ["Directive$ebnf$1$subexpression$1"]},
    {"name": "Directive$ebnf$1$subexpression$2", "symbols": ["InlineOption"]},
    {"name": "Directive$ebnf$1$subexpression$2", "symbols": ["PairingNet"]},
    {"name": "Directive$ebnf$1", "symbols": ["Directive$ebnf$1", "Directive$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Directive", "symbols": [(lexer.has("dAnswer") ? {type: "dAnswer"} : dAnswer), (lexer.has("spaces") ? {type: "spaces"} : spaces), "Directive$ebnf$1"], "postprocess": ([ ,, options ]) => ({ kind: "Directive", name: "answer", options: options.map(v => v[0]) })},
    {"name": "Directive$ebnf$2", "symbols": ["Text"]},
    {"name": "Directive$ebnf$2", "symbols": ["Directive$ebnf$2", "Text"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Directive", "symbols": [(lexer.has("dKVDirective") ? {type: "dKVDirective"} : dKVDirective), (lexer.has("spaces") ? {type: "spaces"} : spaces), "Directive$ebnf$2"], "postprocess": ([ token,, path ]) => ({ kind: "Directive", name: token.value, value: path.join('') })},
    {"name": "Inline", "symbols": ["InlineOption"], "postprocess": id},
    {"name": "Inline", "symbols": [(lexer.has("buttonBlank") ? {type: "buttonBlank"} : buttonBlank)], "postprocess": id},
    {"name": "Inline", "symbols": [(lexer.has("medium") ? {type: "medium"} : medium)], "postprocess": id},
    {"name": "Inline", "symbols": [(lexer.has("spaces") ? {type: "spaces"} : spaces)], "postprocess": ([ token ]) => token.value},
    {"name": "Inline", "symbols": [(lexer.has("forcedLineBreak") ? {type: "forcedLineBreak"} : forcedLineBreak)], "postprocess": id},
    {"name": "Inline", "symbols": ["InlineMath"], "postprocess": id},
    {"name": "Inline", "symbols": ["Text"], "postprocess": id},
    {"name": "Inline", "symbols": ["StyledInline"], "postprocess": id},
    {"name": "Inline", "symbols": ["ClassedInline"], "postprocess": id},
    {"name": "Inline", "symbols": ["LineXMLElement"], "postprocess": id},
    {"name": "Inline", "symbols": ["InlineKnob"], "postprocess": id},
    {"name": "Inline", "symbols": ["ButtonKnob"], "postprocess": id},
    {"name": "Text", "symbols": [(lexer.has("identifiable") ? {type: "identifiable"} : identifiable)], "postprocess": ([ token ]) => token.value},
    {"name": "Text", "symbols": [(lexer.has("title") ? {type: "title"} : title)], "postprocess": ([ token ]) => token.value},
    {"name": "Text", "symbols": [(lexer.has("caption") ? {type: "caption"} : caption)], "postprocess": ([ token ]) => token.value},
    {"name": "Text", "symbols": [(lexer.has("prefix") ? {type: "prefix"} : prefix)], "postprocess": ([ token ]) => token.value},
    {"name": "Text", "symbols": [(lexer.has("character") ? {type: "character"} : character)], "postprocess": ([ token ]) => token.value},
    {"name": "Text", "symbols": [(lexer.has("escaping") ? {type: "escaping"} : escaping), (lexer.has("any") ? {type: "any"} : any)], "postprocess": ([ , token ]) => token.value},
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
    {"name": "ClassedInline$ebnf$2", "symbols": []},
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
    {"name": "XMLElement$macrocall$10", "symbols": [(lexer.has("xActionOpen") ? {type: "xActionOpen"} : xActionOpen)]},
    {"name": "XMLElement$macrocall$11$ebnf$1", "symbols": ["ActionDefinition"]},
    {"name": "XMLElement$macrocall$11$ebnf$1", "symbols": ["XMLElement$macrocall$11$ebnf$1", "ActionDefinition"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "XMLElement$macrocall$11", "symbols": ["XMLElement$macrocall$11$ebnf$1"]},
    {"name": "XMLElement$macrocall$12", "symbols": [(lexer.has("xActionClose") ? {type: "xActionClose"} : xActionClose)]},
    {"name": "XMLElement$macrocall$9$ebnf$1", "symbols": []},
    {"name": "XMLElement$macrocall$9$ebnf$1", "symbols": ["XMLElement$macrocall$9$ebnf$1", "XMLAttribute"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "XMLElement$macrocall$9$ebnf$2", "symbols": [(lexer.has("spaces") ? {type: "spaces"} : spaces)], "postprocess": id},
    {"name": "XMLElement$macrocall$9$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "XMLElement$macrocall$9", "symbols": ["XMLElement$macrocall$10", "XMLElement$macrocall$9$ebnf$1", "XMLElement$macrocall$9$ebnf$2", (lexer.has("tagClose") ? {type: "tagClose"} : tagClose), "XMLElement$macrocall$11", "XMLElement$macrocall$12"], "postprocess":  ([ open, attributes,,, body ]) => ({
          tag: open[0].value,
          attributes,
          body: body[0]
        })},
    {"name": "XMLElement", "symbols": ["XMLElement$macrocall$9"], "postprocess":  ([{ tag, attributes, body }]) => {
          let index = 0;
          for(const { key, value } of attributes){
            if(key !== "for") throw Error(`Unexpected attribute of <action>: ${key}`);
            index = parseInt(value) || 0;
          }
          return { kind: "XMLElement", tag, index, content: body };
        }},
    {"name": "LineXMLElement$macrocall$2", "symbols": [(lexer.has("xTableOpen") ? {type: "xTableOpen"} : xTableOpen)]},
    {"name": "LineXMLElement$macrocall$3", "symbols": ["Table"]},
    {"name": "LineXMLElement$macrocall$4", "symbols": [(lexer.has("xTableClose") ? {type: "xTableClose"} : xTableClose)]},
    {"name": "LineXMLElement$macrocall$1$ebnf$1", "symbols": []},
    {"name": "LineXMLElement$macrocall$1$ebnf$1", "symbols": ["LineXMLElement$macrocall$1$ebnf$1", "XMLAttribute"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "LineXMLElement$macrocall$1$ebnf$2", "symbols": [(lexer.has("spaces") ? {type: "spaces"} : spaces)], "postprocess": id},
    {"name": "LineXMLElement$macrocall$1$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "LineXMLElement$macrocall$1", "symbols": ["LineXMLElement$macrocall$2", "LineXMLElement$macrocall$1$ebnf$1", "LineXMLElement$macrocall$1$ebnf$2", (lexer.has("tagClose") ? {type: "tagClose"} : tagClose), "LineXMLElement$macrocall$3", "LineXMLElement$macrocall$4"], "postprocess":  ([ open, attributes,,, body ]) => ({
          tag: open[0].value,
          attributes,
          body: body[0]
        })},
    {"name": "LineXMLElement", "symbols": ["LineXMLElement$macrocall$1"], "postprocess": ([{ tag, attributes, body }]) => ({ kind: "XMLElement", tag, attributes, content: body })},
    {"name": "LineXMLElement$macrocall$6", "symbols": [(lexer.has("xCOGOpen") ? {type: "xCOGOpen"} : xCOGOpen)]},
    {"name": "LineXMLElement$macrocall$7$ebnf$1", "symbols": ["Inline"]},
    {"name": "LineXMLElement$macrocall$7$ebnf$1", "symbols": ["LineXMLElement$macrocall$7$ebnf$1", "Inline"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "LineXMLElement$macrocall$7", "symbols": ["LineXMLElement$macrocall$7$ebnf$1"]},
    {"name": "LineXMLElement$macrocall$8", "symbols": [(lexer.has("xCOGClose") ? {type: "xCOGClose"} : xCOGClose)]},
    {"name": "LineXMLElement$macrocall$5", "symbols": ["LineXMLElement$macrocall$6", "LineXMLElement$macrocall$7", "LineXMLElement$macrocall$8"], "postprocess": ([ open, body ]) => ({ tag: open[0].value, body: body[0] })},
    {"name": "LineXMLElement", "symbols": ["LineXMLElement$macrocall$5"], "postprocess": ([{ tag, body }]) => ({ kind: "XMLElement", tag, content: body })},
    {"name": "LineXMLElement$macrocall$10", "symbols": [(lexer.has("xPOGOpen") ? {type: "xPOGOpen"} : xPOGOpen)]},
    {"name": "LineXMLElement$macrocall$11$macrocall$2", "symbols": ["PairingOption"]},
    {"name": "LineXMLElement$macrocall$11$macrocall$3", "symbols": [(lexer.has("lineBreak") ? {type: "lineBreak"} : lineBreak)]},
    {"name": "LineXMLElement$macrocall$11$macrocall$1$ebnf$1", "symbols": []},
    {"name": "LineXMLElement$macrocall$11$macrocall$1$ebnf$1$subexpression$1", "symbols": ["LineXMLElement$macrocall$11$macrocall$3", "LineXMLElement$macrocall$11$macrocall$2"]},
    {"name": "LineXMLElement$macrocall$11$macrocall$1$ebnf$1", "symbols": ["LineXMLElement$macrocall$11$macrocall$1$ebnf$1", "LineXMLElement$macrocall$11$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "LineXMLElement$macrocall$11$macrocall$1", "symbols": ["LineXMLElement$macrocall$11$macrocall$2", "LineXMLElement$macrocall$11$macrocall$1$ebnf$1"], "postprocess": ([ first, rest ]) => [ first[0], ...rest.map(v => v[1][0]) ]},
    {"name": "LineXMLElement$macrocall$11", "symbols": ["LineXMLElement$macrocall$11$macrocall$1"]},
    {"name": "LineXMLElement$macrocall$12", "symbols": [(lexer.has("xPOGClose") ? {type: "xPOGClose"} : xPOGClose)]},
    {"name": "LineXMLElement$macrocall$9", "symbols": ["LineXMLElement$macrocall$10", "LineXMLElement$macrocall$11", "LineXMLElement$macrocall$12"], "postprocess": ([ open, body ]) => ({ tag: open[0].value, body: body[0] })},
    {"name": "LineXMLElement", "symbols": ["LineXMLElement$macrocall$9"], "postprocess": ([{ tag, body }]) => ({ kind: "XMLElement", tag, content: body })},
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
        }},
    {"name": "InlineOption", "symbols": ["ChoiceOption"], "postprocess": id},
    {"name": "InlineOption", "symbols": ["ButtonOption"], "postprocess": id},
    {"name": "InlineOption", "symbols": ["ShortLingualOption"], "postprocess": id},
    {"name": "ChoiceOption$ebnf$1", "symbols": ["Text"]},
    {"name": "ChoiceOption$ebnf$1", "symbols": ["ChoiceOption$ebnf$1", "Text"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "ChoiceOption$ebnf$2", "symbols": ["OptionRest"], "postprocess": id},
    {"name": "ChoiceOption$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ChoiceOption", "symbols": [(lexer.has("choiceOptionOpen") ? {type: "choiceOptionOpen"} : choiceOptionOpen), "ChoiceOption$ebnf$1", "ChoiceOption$ebnf$2", (lexer.has("choiceOptionClose") ? {type: "choiceOptionClose"} : choiceOptionClose)], "postprocess":  ([ , first, rest, close ]) => {
          const multiple = rest || close.value.startsWith(",");
          return {
            kind: "ChoiceOption",
            value: multiple ? [ first.join(''), ...(rest?.value || []) ] : first.join(''),
            ordered: multiple ? rest?.kind === "OrderedOptionRest" : undefined
          };
        }},
    {"name": "ButtonOption$ebnf$1", "symbols": ["Text"]},
    {"name": "ButtonOption$ebnf$1", "symbols": ["ButtonOption$ebnf$1", "Text"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "ButtonOption$ebnf$2", "symbols": ["OptionRest"], "postprocess": id},
    {"name": "ButtonOption$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ButtonOption", "symbols": [(lexer.has("buttonOptionOpen") ? {type: "buttonOptionOpen"} : buttonOptionOpen), "ButtonOption$ebnf$1", "ButtonOption$ebnf$2", (lexer.has("buttonOptionClose") ? {type: "buttonOptionClose"} : buttonOptionClose)], "postprocess":  ([ open, first, rest, close ]) => {
          const multiple = rest || close.value.startsWith(",");
          return {
            kind: "ButtonOption",
            id: ++buttonOptionCounter,
            group: open.value.split(',').filter(v => v).map(v => parseInt(v)),
            value: multiple ? [ first.join(''), ...(rest?.value || []) ] : first.join(''),
            ordered: multiple ? rest?.kind === "OrderedOptionRest" : undefined
          };
        }},
    {"name": "OptionRest$ebnf$1$subexpression$1$ebnf$1", "symbols": ["Text"]},
    {"name": "OptionRest$ebnf$1$subexpression$1$ebnf$1", "symbols": ["OptionRest$ebnf$1$subexpression$1$ebnf$1", "Text"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "OptionRest$ebnf$1$subexpression$1", "symbols": [(lexer.has("orderedOptionSeparator") ? {type: "orderedOptionSeparator"} : orderedOptionSeparator), "OptionRest$ebnf$1$subexpression$1$ebnf$1"]},
    {"name": "OptionRest$ebnf$1", "symbols": ["OptionRest$ebnf$1$subexpression$1"]},
    {"name": "OptionRest$ebnf$1$subexpression$2$ebnf$1", "symbols": ["Text"]},
    {"name": "OptionRest$ebnf$1$subexpression$2$ebnf$1", "symbols": ["OptionRest$ebnf$1$subexpression$2$ebnf$1", "Text"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "OptionRest$ebnf$1$subexpression$2", "symbols": [(lexer.has("orderedOptionSeparator") ? {type: "orderedOptionSeparator"} : orderedOptionSeparator), "OptionRest$ebnf$1$subexpression$2$ebnf$1"]},
    {"name": "OptionRest$ebnf$1", "symbols": ["OptionRest$ebnf$1", "OptionRest$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "OptionRest", "symbols": ["OptionRest$ebnf$1"], "postprocess": ([ list ]) => ({ kind: "OrderedOptionRest", value: list.map(v => v[1].join('')) })},
    {"name": "OptionRest$ebnf$2$subexpression$1$ebnf$1", "symbols": ["Text"]},
    {"name": "OptionRest$ebnf$2$subexpression$1$ebnf$1", "symbols": ["OptionRest$ebnf$2$subexpression$1$ebnf$1", "Text"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "OptionRest$ebnf$2$subexpression$1", "symbols": [(lexer.has("unorderedOptionSeparator") ? {type: "unorderedOptionSeparator"} : unorderedOptionSeparator), "OptionRest$ebnf$2$subexpression$1$ebnf$1"]},
    {"name": "OptionRest$ebnf$2", "symbols": ["OptionRest$ebnf$2$subexpression$1"]},
    {"name": "OptionRest$ebnf$2$subexpression$2$ebnf$1", "symbols": ["Text"]},
    {"name": "OptionRest$ebnf$2$subexpression$2$ebnf$1", "symbols": ["OptionRest$ebnf$2$subexpression$2$ebnf$1", "Text"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "OptionRest$ebnf$2$subexpression$2", "symbols": [(lexer.has("unorderedOptionSeparator") ? {type: "unorderedOptionSeparator"} : unorderedOptionSeparator), "OptionRest$ebnf$2$subexpression$2$ebnf$1"]},
    {"name": "OptionRest$ebnf$2", "symbols": ["OptionRest$ebnf$2", "OptionRest$ebnf$2$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "OptionRest", "symbols": ["OptionRest$ebnf$2"], "postprocess": ([ list ]) => ({ kind: "UnorderedOptionRest", value: list.map(v => v[1].join('')) })},
    {"name": "PairingOption$ebnf$1", "symbols": ["Inline"]},
    {"name": "PairingOption$ebnf$1", "symbols": ["PairingOption$ebnf$1", "Inline"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "PairingOption", "symbols": ["PairingCell", "PairingOption$ebnf$1"], "postprocess": ([ cell, inlines ]) => ({ kind: "PairingOption", cell, inlines: trimArray(inlines) })},
    {"name": "PairingCell$ebnf$1", "symbols": [(lexer.has("identifiable") ? {type: "identifiable"} : identifiable)]},
    {"name": "PairingCell$ebnf$1", "symbols": ["PairingCell$ebnf$1", (lexer.has("identifiable") ? {type: "identifiable"} : identifiable)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "PairingCell$ebnf$2$subexpression$1$ebnf$1", "symbols": [(lexer.has("identifiable") ? {type: "identifiable"} : identifiable)]},
    {"name": "PairingCell$ebnf$2$subexpression$1$ebnf$1", "symbols": ["PairingCell$ebnf$2$subexpression$1$ebnf$1", (lexer.has("identifiable") ? {type: "identifiable"} : identifiable)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "PairingCell$ebnf$2$subexpression$1", "symbols": [(lexer.has("pairingSeparator") ? {type: "pairingSeparator"} : pairingSeparator), "PairingCell$ebnf$2$subexpression$1$ebnf$1"]},
    {"name": "PairingCell$ebnf$2", "symbols": ["PairingCell$ebnf$2$subexpression$1"]},
    {"name": "PairingCell$ebnf$2$subexpression$2$ebnf$1", "symbols": [(lexer.has("identifiable") ? {type: "identifiable"} : identifiable)]},
    {"name": "PairingCell$ebnf$2$subexpression$2$ebnf$1", "symbols": ["PairingCell$ebnf$2$subexpression$2$ebnf$1", (lexer.has("identifiable") ? {type: "identifiable"} : identifiable)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "PairingCell$ebnf$2$subexpression$2", "symbols": [(lexer.has("pairingSeparator") ? {type: "pairingSeparator"} : pairingSeparator), "PairingCell$ebnf$2$subexpression$2$ebnf$1"]},
    {"name": "PairingCell$ebnf$2", "symbols": ["PairingCell$ebnf$2", "PairingCell$ebnf$2$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "PairingCell", "symbols": [(lexer.has("choiceOptionOpen") ? {type: "choiceOptionOpen"} : choiceOptionOpen), "PairingCell$ebnf$1", "PairingCell$ebnf$2", (lexer.has("choiceOptionClose") ? {type: "choiceOptionClose"} : choiceOptionClose)], "postprocess":  ([ , first, rest ], _, reject) => {
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
        }},
    {"name": "ShortLingualOption$ebnf$1", "symbols": [(lexer.has("shortLingualDefaultValue") ? {type: "shortLingualDefaultValue"} : shortLingualDefaultValue)], "postprocess": id},
    {"name": "ShortLingualOption$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ShortLingualOption$ebnf$2", "symbols": []},
    {"name": "ShortLingualOption$ebnf$2", "symbols": ["ShortLingualOption$ebnf$2", "Text"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "ShortLingualOption", "symbols": [(lexer.has("shortLingualOptionOpen") ? {type: "shortLingualOptionOpen"} : shortLingualOptionOpen), "ShortLingualOption$ebnf$1", "ShortLingualOption$ebnf$2", (lexer.has("shortLingualOptionClose") ? {type: "shortLingualOptionClose"} : shortLingualOptionClose)], "postprocess":  ([ , defaultValue, value ]) => ({
          kind: "ShortLingualOption",
          value: value.join(''),
          defaultValue: Boolean(defaultValue)
        })},
    {"name": "PairingNet$macrocall$2", "symbols": ["PairingNetItem"]},
    {"name": "PairingNet$macrocall$3", "symbols": [(lexer.has("arraySeparator") ? {type: "arraySeparator"} : arraySeparator)]},
    {"name": "PairingNet$macrocall$1$ebnf$1", "symbols": []},
    {"name": "PairingNet$macrocall$1$ebnf$1$subexpression$1", "symbols": ["PairingNet$macrocall$3", "PairingNet$macrocall$2"]},
    {"name": "PairingNet$macrocall$1$ebnf$1", "symbols": ["PairingNet$macrocall$1$ebnf$1", "PairingNet$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "PairingNet$macrocall$1", "symbols": ["PairingNet$macrocall$2", "PairingNet$macrocall$1$ebnf$1"], "postprocess": ([ first, rest ]) => [ first[0], ...rest.map(v => v[1][0]) ]},
    {"name": "PairingNet", "symbols": [(lexer.has("pairingNetOpen") ? {type: "pairingNetOpen"} : pairingNetOpen), "PairingNet$macrocall$1", (lexer.has("pairingNetClose") ? {type: "pairingNetClose"} : pairingNetClose)], "postprocess":  ([ { value: name }, list ]) => ({
          kind: "PairingNet",
          name,
          list
        })},
    {"name": "PairingNetItem$ebnf$1", "symbols": [(lexer.has("spaces") ? {type: "spaces"} : spaces)], "postprocess": id},
    {"name": "PairingNetItem$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "PairingNetItem$ebnf$2", "symbols": [(lexer.has("identifiable") ? {type: "identifiable"} : identifiable)]},
    {"name": "PairingNetItem$ebnf$2", "symbols": ["PairingNetItem$ebnf$2", (lexer.has("identifiable") ? {type: "identifiable"} : identifiable)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "PairingNetItem$ebnf$3", "symbols": [(lexer.has("identifiable") ? {type: "identifiable"} : identifiable)]},
    {"name": "PairingNetItem$ebnf$3", "symbols": ["PairingNetItem$ebnf$3", (lexer.has("identifiable") ? {type: "identifiable"} : identifiable)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "PairingNetItem$ebnf$4", "symbols": [(lexer.has("spaces") ? {type: "spaces"} : spaces)], "postprocess": id},
    {"name": "PairingNetItem$ebnf$4", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "PairingNetItem", "symbols": [(lexer.has("pairingNetItemOpen") ? {type: "pairingNetItemOpen"} : pairingNetItemOpen), "PairingNetItem$ebnf$1", "PairingNetItem$ebnf$2", (lexer.has("pairingNetItemArrow") ? {type: "pairingNetItemArrow"} : pairingNetItemArrow), "PairingNetItem$ebnf$3", "PairingNetItem$ebnf$4", (lexer.has("pairingNetItemClose") ? {type: "pairingNetItemClose"} : pairingNetItemClose)], "postprocess":  ([ ,, from,, to ]) => ({
          kind: "PairingNetItem",
          from: from.join(''),
          to: to.join('')
        })},
    {"name": "InlineKnob$ebnf$1", "symbols": ["Inline"]},
    {"name": "InlineKnob$ebnf$1", "symbols": ["InlineKnob$ebnf$1", "Inline"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "InlineKnob", "symbols": [(lexer.has("inlineKnobOpen") ? {type: "inlineKnobOpen"} : inlineKnobOpen), "InlineKnob$ebnf$1", (lexer.has("inlineKnobClose") ? {type: "inlineKnobClose"} : inlineKnobClose)], "postprocess": ([ { value }, inlines ]) => ({ kind: "InlineKnob", index: parseInt(value), inlines: trimArray(inlines) })},
    {"name": "ButtonKnob$ebnf$1", "symbols": ["Inline"]},
    {"name": "ButtonKnob$ebnf$1", "symbols": ["ButtonKnob$ebnf$1", "Inline"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "ButtonKnob", "symbols": [(lexer.has("buttonKnobOpen") ? {type: "buttonKnobOpen"} : buttonKnobOpen), "ButtonKnob$ebnf$1", (lexer.has("buttonKnobClose") ? {type: "buttonKnobClose"} : buttonKnobClose)], "postprocess": ([ { value }, inlines ]) => ({ kind: "ButtonKnob", index: parseInt(value), inlines: trimArray(inlines) })},
    {"name": "ActionDefinition$ebnf$1", "symbols": [(lexer.has("allSpaces") ? {type: "allSpaces"} : allSpaces)], "postprocess": id},
    {"name": "ActionDefinition$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ActionDefinition$ebnf$2", "symbols": [(lexer.has("allSpaces") ? {type: "allSpaces"} : allSpaces)], "postprocess": id},
    {"name": "ActionDefinition$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ActionDefinition$ebnf$3", "symbols": [(lexer.has("allSpaces") ? {type: "allSpaces"} : allSpaces)], "postprocess": id},
    {"name": "ActionDefinition$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ActionDefinition$macrocall$2", "symbols": ["Action"]},
    {"name": "ActionDefinition$macrocall$3$ebnf$1", "symbols": [(lexer.has("allSpaces") ? {type: "allSpaces"} : allSpaces)], "postprocess": id},
    {"name": "ActionDefinition$macrocall$3$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ActionDefinition$macrocall$3$ebnf$2", "symbols": [(lexer.has("allSpaces") ? {type: "allSpaces"} : allSpaces)], "postprocess": id},
    {"name": "ActionDefinition$macrocall$3$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ActionDefinition$macrocall$3", "symbols": ["ActionDefinition$macrocall$3$ebnf$1", {"literal":","}, "ActionDefinition$macrocall$3$ebnf$2"]},
    {"name": "ActionDefinition$macrocall$1$ebnf$1", "symbols": []},
    {"name": "ActionDefinition$macrocall$1$ebnf$1$subexpression$1", "symbols": ["ActionDefinition$macrocall$3", "ActionDefinition$macrocall$2"]},
    {"name": "ActionDefinition$macrocall$1$ebnf$1", "symbols": ["ActionDefinition$macrocall$1$ebnf$1", "ActionDefinition$macrocall$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "ActionDefinition$macrocall$1", "symbols": ["ActionDefinition$macrocall$2", "ActionDefinition$macrocall$1$ebnf$1"], "postprocess": ([ first, rest ]) => [ first[0], ...rest.map(v => v[1][0]) ]},
    {"name": "ActionDefinition$ebnf$4", "symbols": [(lexer.has("allSpaces") ? {type: "allSpaces"} : allSpaces)], "postprocess": id},
    {"name": "ActionDefinition$ebnf$4", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ActionDefinition$ebnf$5", "symbols": [(lexer.has("allSpaces") ? {type: "allSpaces"} : allSpaces)], "postprocess": id},
    {"name": "ActionDefinition$ebnf$5", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ActionDefinition", "symbols": ["ActionDefinition$ebnf$1", (lexer.has("actionCondition") ? {type: "actionCondition"} : actionCondition), "ActionDefinition$ebnf$2", {"literal":"{"}, "ActionDefinition$ebnf$3", "ActionDefinition$macrocall$1", "ActionDefinition$ebnf$4", {"literal":"}"}, "ActionDefinition$ebnf$5"], "postprocess":  ([ , condition,,,, actions ]) => ({
          kind: "ActionDefinition",
          condition,
          actions
        })},
    {"name": "Action", "symbols": [(lexer.has("aPlay") ? {type: "aPlay"} : aPlay), (lexer.has("medium") ? {type: "medium"} : medium)], "postprocess": ([ , medium ]) => ({ kind: "Action", command: "play", medium: medium.value })},
    {"name": "Action$ebnf$1", "symbols": ["Text"]},
    {"name": "Action$ebnf$1", "symbols": ["Action$ebnf$1", "Text"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Action$ebnf$2", "symbols": [(lexer.has("lineBreak") ? {type: "lineBreak"} : lineBreak)], "postprocess": id},
    {"name": "Action$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "Action", "symbols": [(lexer.has("aReplace") ? {type: "aReplace"} : aReplace), "Action$ebnf$1", "Action$ebnf$2"], "postprocess": ([ , value ]) => ({ kind: "Action", command: "replace", value: value.join('') })},
    {"name": "Action", "symbols": [(lexer.has("action") ? {type: "action"} : action)], "postprocess": ([ { value } ]) => ({ kind: "Action", ...value })}
]
  , ParserStart: "Main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
