Discourse.PostView.reopen({
  createChecklistUI: function($post) {

    if (!this.get('post').can_edit) { return };

    var boxes = $post.find(".chcklst-box"),
        view = this.get('post'),
        user = Discourse.User.currentProp('username');

    boxes.each(function(idx, val) {
      $(val).click(function(ev) {
        var elem = $(ev.currentTarget),
            new_value = elem.hasClass("checked") ? "[ ] #VolunteerNeeded": "[*] @" + user,
            poller = Discourse.ajax("/posts/" + view.id + ".json");

        elem.after('<i class="fa fa-spinner fa-spin"></i>');
        elem.hide();

        poller.then(function(result) {
          var nth = -1, // make the first run go to index = 0
              new_raw = result.raw.replace(/(\[([\ \_\-\x\*]?)\])(\s((@|#)\w+))?/g, function(match, args, offset) {
                nth += 1;
                return nth == idx ? new_value : match;
              });
      Discourse.ajax("/posts/" + view.id, {
        type: "PUT",
        data: {
          "post[raw]" : new_raw,
          "post[edit_reason]" : "volunteered"
        }
      });
        });
      });
    });

    // confirm the feature is enabled by showing the click-ability
    boxes.css({"cursor": "pointer"});

  }.on('postViewInserted', 'postViewUpdated'),

  destroyChecklistUI: function() {
  }.on('willClearRender')
});