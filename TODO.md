TODO
====

Tasks and notes about tasks to complete and polish tigger.

actionables
-----------

* Modify tags on a tigger and make the appropriate FS changes.
* Delete/rename a tag across all tiggers.
* Simultaneous watch room like rabbit.

fs.watch (not urgent)
---------------------

Write a parser for these events, to improve performance.

For each action (create/rename/delete) 1, 2, or 3 events are fired.

Rename actions have a before and after event fired. Both are type `rename`. Both have the path of the file relative to root.

Create actions are similar but do not fire a before event, since the file simply didn't exist before.

Delete actions are similar but do not fire an after event, since the file simply doesn't exist after.

The final event is the parent directory of any action, but this event doesn't fire for actions in root. This is type `change`.

rename b\a\New Text Document.txt  #From name

rename b\a\tigger ba.txt          #To   new name

change b\a                        #Parent folder of rename

rename New folder                 #Directory created in root

rename New folder                 #Directory deleted in root

rename New folder                 #From name

rename c                          #To   new name
                                  #No parent folder cause this is in root

rename c\New folder               #Directory created in c

change c                          #Parent folder of create

```javascript
fs.watch(root, {recursive: true}, (eventType, filename) => {
    console.log(eventType, filename);
});
```