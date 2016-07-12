import { registerOption } from 'pretty-text/pretty-text';

registerOption((siteSettings, opts) => {
  opts.features['color'] = true;
});

export function setup(helper) {
	function replaceFontColor (text) {
	  while (text != (text = text.replace(/\[color=([^\]]+)\]((?:(?!\[color=[^\]]+\]|\[\/color\])[\S\s])*)\[\/color\]/ig, function (match, p1, p2, offset, string) {
	    return "<font color='" + p1 + "'>" + p2 + "</font>";
	  })));
	  return text;
	}
	helper.whiteList([ 'font.color']);
}