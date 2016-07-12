import { registerOption } from 'pretty-text/pretty-text';

registerOption((siteSettings, opts) => {
  opts.features['fortawesome'] = true;
});


function makeAwesom(helper) {
  helper.inlineRegexp({
    start: '[fa:',
    matcher: /^\[fa:([a-z-]+)\]/,
	emitter: function(contents) {
	  var icon = contents[1];
	  return ['i', {class: 'fa fa-' + icon} ];
	}
  });
}
export function setup(helper) {
	helper.whiteList(['i.fa']);
	helper.addPreProcessor(makeAwesom);
}
