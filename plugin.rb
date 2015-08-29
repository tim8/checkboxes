# name: volunteer-boxes
# version: 2
# authors: root

register_asset 'javascripts/checklist.js.erb', :server_side
register_asset "javascripts/checklist_ui.js"

register_css <<CSS

span.chcklst-stroked {
	text-decoration: line-through;
}

CSS
