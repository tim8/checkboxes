import { registerOption } from 'pretty-text/pretty-text';

registerOption((siteSettings, opts) => {
  opts.features['checkboxes'] = !!siteSettings.checkboxes_enabled;
});

const REGEX = /\[(\s?|_|-|x|\*)\]/ig;

function getClasses(str) {
  switch(str.toLowerCase()) {
    case "x":
      return "checked fa fa-check-square";
    case "*":
      return "checked fa fa-check-square-o";
    case "-":
      return "fa fa-minus-square-o";
    case "_":
      return "fa fa-square";
    default:
      return "fa fa-square-o";
  }
}

function replaceFontColor(text) {
  text = text || "";
  while (text !== (text = text.replace(/\[color=([^\]]+)\]((?:(?!\[color=[^\]]+\]|\[\/color\])[\S\s])*)\[\/color\]/ig, function (match, p1, p2) {
    return `<font color='${p1}'>${p2}</font>`;
  })));
  return text;
}

function replaceFontBgColor(text) {
  text = text || "";
  while (text !== (text = text.replace(/\[bgcolor=([^\]]+)\]((?:(?!\[bgcolor=[^\]]+\]|\[\/bgcolor\])[\S\s])*)\[\/bgcolor\]/ig, function (match, p1, p2) {
    return `<span style='background-color:${p1}'>${p2}</span>`;
  })));
  return text;
}



function addCheckbox(result, content, match, state) {
  let classes = getClasses(match[1]);
  let token = new state.Token('check_open', 'span', 1);
  token.attrs = [['class', `chcklst-box ${classes}`]];
  result.push(token);

  token = new state.Token('check_close', 'span', -1);
  result.push(token);
}

function applyCheckboxes(content, state) {

  let result = null,
      pos = 0,
      match;

  while (match = REGEX.exec(content)) {

    if (match.index > pos) {
      result = result || [];
      let token = new state.Token('text', '', 0);
      token.content = content.slice(pos, match.index);
      result.push(token);
    }

    pos = match.index + match[0].length;

    result = result || [];
    addCheckbox(result, content, match, state);
  }

  if (result && pos < content.length) {
    let token = new state.Token('text', '', 0);
    token.content = content.slice(pos);
    result.push(token);
  }

  return result;
}

function processChecklist(state) {
  var i, j, l, tokens, token,
      blockTokens = state.tokens,
      nesting = 0;

  for (j = 0, l = blockTokens.length; j < l; j++) {
    if (blockTokens[j].type !== 'inline') { continue; }
    tokens = blockTokens[j].children;

    // We scan from the end, to keep position when new tags are added.
    // Use reversed logic in links start/end match
    for (i = tokens.length - 1; i >= 0; i--) {
      token = tokens[i];

      nesting += token.nesting;

      if (token.type === 'text' && nesting === 0) {
        let processed = applyCheckboxes(token.content, state);
        if (processed) {
          blockTokens[j].children = tokens = state.md.utils.arrayReplaceAt(tokens, i, processed);
        }
      }
    }
  }

}


function setupMarkdownIt(helper) {
  helper.registerOptions((opts, siteSettings)=>{
    opts.features['checklist'] = !!siteSettings.checklist_enabled;
  });

  helper.registerPlugin(md =>{
    md.core.ruler.push('checklist', processChecklist);
    const ruler = md.inline.bbcode.ruler;

    ruler.push('bgcolor', {
      tag: 'bgcolor',
      wrap: function(token, endToken, tagInfo){
        token.type = 'span_open';
        token.tag = 'span';
        token.attrs = [['style', 'background-color:' + tagInfo.attrs._default.trim()]];
        token.content = '';
        token.nesting = 1;

        endToken.type = 'span_close';
        endToken.tag = 'span';
        endToken.nesting = -1;
        endToken.content = '';
      }
    });

    ruler.push('color', {
      tag: 'color',
      wrap: function(token, endToken, tagInfo){
        token.type = 'font_open';
        token.tag = 'font';
        token.attrs = [['color', tagInfo.attrs._default]];
        token.content = '';
        token.nesting = 1;

        endToken.type = 'font_close';
        endToken.tag = 'font';
        endToken.nesting = -1;
        endToken.content = '';
      }
    });
  });

  helper.inlineRegexp({
    start: '[vr:',
    matcher: /^\[vr:([0-9a-z-]+)\]/,
    emitter: function(contents) {
      var icon = contents[1];
      return ["i", {"class": "vri-" + icon} ];
    }
  });

/*  helper.inlineRegexp({
    start: '[trivia:',
    matcher: /^\[trivia:([0-9]+)\]/,
    emitter: function(contents) {
      var points = contents[1];
      return '<i class="vri-live"></i> <font color="orange"><strong>VL (+' + points + ' pts)</strong></font>';
    }
  });*/
  helper.inlineRegexp({
    start: '[trivia',
    matcher: /^\[trivia(?:\:(.*?))?\](.*?)\[\/trivia\]/,
    emitter: function(contents) {
      if(contents[1] ){
        return '<i class="vri-live"></i> <a href="//vigglerumors.com/trivia/' + contents[1] + '"><font color="orange"><strong>' + contents[2] + '</strong></font> <i class="fa fa-external-link"></i></a>';  
      }

      return '<i class="vri-live"></i> <font color="orange"><strong>' + contents[2] + '</strong></font>';

    }
  });

  helper.inlineRegexp({
    start: '[sound:',
    matcher: /^\[sound:(\d\d?[xX])?\:?([0-9]+)?\]/,
    emitter: function(contents) {
      var bpo = parseInt(contents[1]); 
      if(bpo > 2){
        var color = 'red';
      }else{
        var color = 'gray';
      }

      var result = '<i class="vri-tv-v"></i> <font color="' + color + '"><strong>';
      if(contents[1]){
        result += contents[1].toUpperCase() + ' ';  
      }
      if(contents[2]){
        result += '(' + contents[2] + ' pts)';
      }
      if(contents[1] || contents[2]){
        return  result + '</strong></font>';
      }
    }
  });
}

export function setup(helper) {
  helper.whiteList([ 
    'span.chcklst-stroked',
    'span.chcklst-box fa fa-square-o',
    'span.chcklst-box fa fa-square',
    'span.chcklst-box fa fa-minus-square-o',
    'span.chcklst-box checked fa fa-check-square',
    'span.chcklst-box checked fa fa-check-square-o',
    'i[class]',
    'font[color]'
  ]);
  helper.whiteList({
    custom(tag, name, value) {
      if (tag === 'span' && name === 'style') {
        return /^background-color:.*$/.exec(value);
      }
    }
  });
  setupMarkdownIt(helper);
  helper.inlineRegexp({
    start: '[fa:',
    matcher: /^\[fa:([a-z-]+)\]/,
    emitter: function(contents) {
      var icon = contents[1];
      return ["i", {"class": "fa fa-" + icon} ];
    }
  });

}