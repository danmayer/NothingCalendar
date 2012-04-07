# NothingCalendar activity tracking

This project aims to help tracking arbitrary events. Such as working out every day, quitting smoking, reading, writing, or whatever chain you are currently working on. It is inspired by the popular Seinfeld don't break the chain concept. It also was based originally on Calendar about Nothing, which implements the don't break the chain concept for committing to open source. I wanted to track keeping a chain alive for things other than open source so this project began.

### Goals
* Simple shared my-chain calendar
* full mobile support
* full offline mode (installable as html5 app, offline syncing, etc)

---

### Todos
* possibly go back to live link (can't return false) but not always updating link
    (look at js delegate method)
* multiple track chains (tagging on chains (workout, quit smoking, etc))
* conflict resolution: offers take local, take server version, or merge. (first two are done now need a merge option and better UI for the first two)
* mobile offline detection seems to be failing
* possible FTE about site 'intro' then cookie user so they never see again
* rewrite all views as mustache, so they can be server or client side
* use JS framework, backbone.js, etc rewrite calendar in framework
* more efficient packaging of JS (concat and minify), remove lawnchair plugins we aren't using.
* ajax actions (smooth CSS animation transitions)
* coffeescript asset pipeline rails 3.1 upgrade
* improve look delete account button
* improve look of user list with mobile table link or similiar UI
* look at using perftools/rack_perftools to find dead code on production requests
    * https://github.com/tmm1/perftools.rb/
    * http://stackoverflow.com/questions/4823840/dead-code-detection-in-ruby
    * https://github.com/bhb/rack-perftools_profiler
* start discoverable api returning all json (done now need posting, etc, actions)
* add live error reporting hoptoad or whatnot for site
* add hurl / api links to README
* possible phonegap compatibility for native android / iphone app.
* now deal with styling issues for iphone... thinkin CSS selector to deal with 320 screens.


### Later
* Build out as a generic rails or ActiveRecord plugin that syncs offline storage / json. Doesn't have to be on user model. Needs a unique id to associate / sync to and a key. Then you could have acts_as_syncable or some such on any model, or perhaps the plugin creates its own model with a foreign key to the declared model. either way to allow for generic sync, restore, and merge.
* full api support
* plugins (build a plugin that automatically ads marks for tweeting, pushing to github, for funning with fitbit, etc), allow others to contribute plugins
* add to iGoogle
* possible OS X widget
* android widget
* different concept of goal (not every day but twice a week (Erin's feature))
* (possibly move to a plugin) how we handle Error messages on root url (not rails), setup flash endpoint (endpoint always removes cookie) and set a cookie, using after filter
* user list page optional so people can browse people's calendars, current exists but everyone is public by default (public vs. private options?)
