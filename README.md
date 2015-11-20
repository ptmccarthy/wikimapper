# WikiMapper
## A Chrome extension to map your Wikipedia navigation.

WikiMapper creates a historical tree of your Wikipedia browsing so that you can see just exactly how you spontaneously wasted 45 minutes and ended up reading about the history of Agriculture in Uzbekistan.

WikiMapper is available for free in the Chrome Web Store! [Click here.](https://chrome.google.com/webstore/detail/wikimapper/feiheebgoilmbkaddngcoocjbogfchlb?hl=en&gl=US)

![This xkcd comic illustrates the purpose pretty well.](http://imgs.xkcd.com/comics/the_problem_with_wikipedia.png)

(Comic source: http://xkcd.com/214/)

### How It Works

WikiMapper runs in the background and only collects page data when browsing on the `wikipedia.org` and `wikimedia.org` domains.

WikiMapper primarily makes use of the `chrome.webNavigation` APIs to detect and correllate browsing activity. Data is stored locally in Chrome's' `localStorage`.

To open the WikiMapper application, click on the ![WikiMapper](https://github.com/ptmccarthy/wikimapper/blob/master/src/resources/wikimapper-16.png) icon in Chrome's toolbar.

### Privacy

WikiMapper is truly free software (MIT license) and does not serve any ads, collect any personal information, or transmit any data to anyone.
