## 0.7.2 (03-17-2014)
Bugfixes:
- Always display 2-digit hour in timestamp (I'm an idiot, previous release didn't fix it).

Github Issues Closed: #59

## 0.7.1 (03-17-2014)
Bugfixes:
- Always display 2-digit hour in timestamp

Github Issues Closed: #59

## 0.7.0 (03-17-2014)
Features:
- Completely redone history viewer UI that is much slicker
- Many other smaller overall look and feel improvements and tweaks
- Lots of overdue code clean up

Bugfixes:
- Page elements no longer flicker during transitions

Github Issues Closed:
- #25, #57

## 0.6.6 (03-13-2014)
Features:
- Node labels on graphs are now a link to the associated Wikipedia page
- Cursor changes to a pointer when hovering over buttons

Github Issues Closed:
- #55, #56

## 0.6.5 (03-10-2014)
Features:
- The graph's height is now calculated from the browser window's height when drawn

Bugfixes:
- Node labels changed from SVG text element to SVG foreignObject containing a div of class label, allowing for word wrap.

Github Issues Closed:
- #10, #54


## 0.6.4 (03-09-2014)
Bugfixes:
- Fixed a race condition bug when displaying the WikiMapper history that would cause the history page to be blank, despite localStorage correctly containing the history.

Github Issues Closed:
- #53

## 0.6.3 (03-08-2014)
Bugfixes:
- Fixed an issue where page names would not get formatted correctly if the same page had been previously visited in a session.
- Added a proper 19x19 toolbar icon rather than upscaling a 16x16 icon

Github Issues Closed:
- #43, 52


## 0.6.2 (02-03-2014)
Features:
- Added a message listener for chrome.runtime.onInstalled for a first-run welcome message
- Minor UI tweaks

Bugfixes:
- Removed an extraneous log message that was printed on the console every time tree.js was loaded

Github Issues Closed:
- #50

## 0.6.1 (01-28-2014)
Bugfixes:
- Fixed an issue when collapsing a node that caused the svg to get horizontally resized before the animation completed

Updates:
- Updated jQuery from 2.0.3 to 2.1.0
- Updated D3 from 3.1.7 to 3.4.1

Github Issues Closed:
- #25, #43, #47, #48, #49

## 0.6.0 (01-24-2014)
Features:
- Revamped, better-looking, more minimalistic interface
- Dynamic horizontal SVG sizing based on tree depth
- Enhanced interactive tree rendering for collapsing/expanding nodes and improved readability

Bugfixes:
- Fixed an issue where deleting the last tree in localStorage would cause errors and the welcome message to not appear as it should.

Github Issues Closed:
- #27, #30, #35, #45

## 0.5.2 (01-20-2014)
Features:
- Wikimapper now tracks pages visited on Wiktionary alongside Wikipedia.

Github Issues Closed:
- #40

## 0.5.1 (01-17-2014)
Bugfixes:
- Added "form_submit" to the transitionType filter for recording

Github Issues Closed:
- #44

## 0.5.0 (01-17-2014)

Features:
- Sessioning! Wikimapper can now handle concurrent wikipedia sessions, i.e., can manage and update multiple trees at once.
- Complete overhaul of event handling that is both much faster  AND much more reliable by no longer relying on a completely loaded DOM to inject a content script for data collection.
- Navigation transition events are filtered so that only 'links' and 'typed' events are recorded. This should discard page refresh, back button, reopened tab, and other similar noise events.

Bugfixes:
- Fixed dates sometimes displaying incorrectly in the history
- Recording a new root node no longer reset the entire tree

Github Issues Closed:
- #1 , #33 , #34 , #37 , #38 , #39 , #41 , #42
