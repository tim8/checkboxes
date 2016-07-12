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

function replaceFontColor (text) {
  while (text != (text = text.replace(/\[color=([^\]]+)\]((?:(?!\[color=[^\]]+\]|\[\/color\])[\S\s])*)\[\/color\]/ig, function (match, p1, p2, offset, string) {
    return "<font color='" + p1 + "'>" + p2 + "</font>";
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
  helper.whiteList([ 'span.chcklst-stroked',
                     'span.chcklst-box fa fa-square-o',
                     'span.chcklst-box fa fa-square',
                     'span.chcklst-box fa fa-minus-square-o',
                     'span.chcklst-box checked fa fa-check-square',
                     'span.chcklst-box checked fa fa-check-square-o',
                     'i.fa fa-*',
                     'font color' ]);
  helper.addPreProcessor(replaceCheckboxes);

  helper.inlineRegexp({
    start: '[fa:',
    matcher: /^\[fa:([a-z-]+)\]/,
    emitter: function(contents) {
      var icon = contents[1];
      return ['i', {class: 'fa fa-' + icon} ];
    }
  });
}