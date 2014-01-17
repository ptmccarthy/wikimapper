## 0.5.1 (01-17-2014)
Bugfixes:
- Added "form_submit" to the transitionType filter for recording

Github Issues Closed:
- #44

## 0.5.0 (01-17-2014)

Features:
- Sessioning! Wikimapper can now handle concurrent wikipedia sessions, i.e., can manage and update multiple trees at once.
- Complete overhaul of event handling that is both much faster	AND much more reliable by no longer relying on a completely loaded DOM to inject a content script for data collection.
- Navigation transition events are filtered so that only 'links' and 'typed' events are recorded. This should discard page refresh, back button, reopened tab, and other similar noise events.

Bugfixes:
- Fixed dates sometimes displaying incorrectly in the history
- Recording a new root node no longer reset the entire tree

Github Issues Closed:
- #1 , #33 , #34 , #37 , #38 , #39 , #41 , #42