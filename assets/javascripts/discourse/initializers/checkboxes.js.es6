import { withPluginApi } from 'discourse/lib/plugin-api';
import AjaxLib from 'discourse/lib/ajax';
import TextLib from 'discourse/lib/text';

function initializePlugin(api)
{
    api.decorateCooked(checklistSyntax);
}

export default function checklistSyntax($elem, post)
{
  if (!post) { return; }

  var boxes = $elem.find(".chcklst-box"),
    viewPost = post.getModel();

  if (!viewPost.can_edit) { return; }

  boxes.each(function(idx, val)
  {
    $(val).click(function(ev)
    {
      var elem = $(ev.currentTarget),
        user = Discourse.User.current().get('username');

        if(ev.altKey)
        {
          var user = prompt("Enter a valid username",user);
          if (user == false) 
            { return; }
          else if (user == "live")
            { var new_value = "[x] [live.vigglerumors.com](http://live.vigglerumors.com)" }
          else
          { var new_value = "[*] @" + user; }
        }
        else
        {
          if(elem.hasClass("checked"))
          {
            var remove =  confirm("Are you sure you want to un-volunteer?");
            if (remove == false) { return; }
          }
          var new_value = elem.hasClass("checked") ? "[ ] #VolunteerNeeded": "[*] @" + user;
        }

      elem.after('<i class="fa fa-spinner fa-spin"></i>');
      elem.hide();

      var postId = viewPost.id;
      AjaxLib.ajax("/posts/" + postId, { type: 'GET', cache: false }).then(function(result)
      {
        var nth = -1, // make the first run go to index = 0
          new_raw = result.raw.replace(/(\[([x\ \_\-\*]?)\])\s(\[.*\)|((@|#)\w+))?/g, function(match, args, offset)
          {
            nth += 1;
            return nth == idx ? new_value : match;
          });

        var props = {
          raw: new_raw,
          edit_reason: 'volunteered',
          cooked: TextLib.cook(new_raw).string
        };
        viewPost.save(props);
      });
    });
  });

  // confirm the feature is enabled by showing the click-ability
  boxes.css({"cursor": "pointer"});
}

export default {
  name: 'checkboxes',
  initialize: function(container)
  {
    withPluginApi('0.1', api => initializePlugin(api));
  }
};