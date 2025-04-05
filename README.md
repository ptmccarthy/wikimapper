# WikiMapper
![WikiMapper](https://github.com/ptmccarthy/wikimapper/blob/master/src/resources/wikimapper-banner-small.png)

## A Chrome & Firefox extension to map your Wikipedia navigation.

WikiMapper creates a historical tree of your Wikipedia browsing so that you can see just exactly how you spontaneously wasted 45 minutes and ended up reading about the history of Agriculture in Uzbekistan.

**NEW!** WikiMapper now supports the Browser Extension Manifest v3 standard, hopefully ensuring many more years of functionality! Thank you to everyone who reached out to support modernizing this extension, it was no small task and your encouragement made it happen!

WikiMapper is available for free in both the [Chrome Web Store](https://chrome.google.com/webstore/detail/wikimapper/feiheebgoilmbkaddngcoocjbogfchlb?hl=en&gl=US) and the [Firefox Add-Ons Catalog](https://addons.mozilla.org/en-US/firefox/addon/wikimapper-ff/)!

![This xkcd comic illustrates the purpose pretty well.](http://imgs.xkcd.com/comics/the_problem_with_wikipedia.png)

(Comic source: http://xkcd.com/214/)

### How It Works

WikiMapper runs in the background and only collects page data when browsing on the `wikipedia.org` and `wikimedia.org` domains.

WikiMapper primarily makes use of the `webNavigation` APIs to detect and correllate browsing activity. Data is stored locally in your browser's' `localStorage`.

To open the WikiMapper application, after installing it, click on the ![WikiMapper](https://github.com/ptmccarthy/wikimapper/blob/master/src/resources/wikimapper-16.png) icon in your browser's toolbar.

### Privacy

WikiMapper is truly free software (MIT license) and does not serve any ads, collect any personal information, or transmit any data to anyone.
