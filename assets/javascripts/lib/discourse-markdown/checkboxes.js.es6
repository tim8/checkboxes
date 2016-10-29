import { registerOption } from 'pretty-text/pretty-text';

registerOption((siteSettings, opts) => {
  opts.features['checkboxes'] = !!siteSettings.checkboxes_enabled;
});

function replaceCheckboxes(text) {
  text = text || "";
  text = text.replace(/\[\s?\]/ig, '<span class="chcklst-box fa fa-square-o"></span>');
  text = text.replace(/\[_\]/ig, '<span class="chcklst-box fa fa-square"></span>');
  text = text.replace(/\[-\]/ig, '<span class="chcklst-box fa fa-minus-square-o"></span>');
  text = text.replace(/\[x\]/ig, '<span class="chcklst-box checked fa fa-check-square"></span>');
  text = text.replace(/\[\*\]/ig, '<span class="chcklst-box checked fa fa-check-square-o"></span>');
  text = text.replace(/!<span class="chcklst-box (checked )?(fa fa-(square-o|square|minus-square-o|check-square|check-square-o))"><\/span>\(/ig, "![](");
  return text;
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

export function setup(helper) {
  helper.inlineBetween({
    between: "--",
    emitter: function(contents) {
      return ["span", {"class": "chcklst-stroked"}].concat(contents);
    }
  });
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

  helper.addPreProcessor(text => replaceFontColor(text));
  helper.addPreProcessor(text => replaceFontBgColor(text));
  helper.addPreProcessor(replaceCheckboxes);
  
  helper.inlineRegexp({
    start: '[fa:',
    matcher: /^\[fa:([a-z-]+)\]/,
    emitter: function(contents) {
      var icon = contents[1];
      return ["i", {"class": "fa fa-" + icon} ];
    }
  });
  helper.inlineRegexp({
    start: '[vr:',
    matcher: /^\[vr:([0-9a-z-]+)\]/,
    emitter: function(contents) {
      var icon = contents[1];
      return ["i", {"class": "vri-" + icon} ];
    }
  });

  helper.inlineRegexp({
    start: '[trivia:',
    matcher: /^\[trivia:([0-9]+)\]/,
    emitter: function(contents) {
      var points = contents[1];
      return '<i class="vri-live"></i> <font color="orange"><strong>VL (+' + points + ' pts)</strong></font>';
    }
  });

  helper.inlineRegexp({
    start: '[sound:',
    matcher: /^\[sound:(\d\d?[xX])?\:?([0-9]+)?\]/,
    emitter: function(contents) {
      var result = '<i class="vri-tv-v"></i> <font color="red"><strong>';
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