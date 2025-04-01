#!/bin/zsh 
BASE_DIR=$(pwd)/dist

cd $BASE_DIR/firefox && zip -r -FS ../wikimapper-firefox.zip * -x ".*"
cd $BASE_DIR/chrome && zip -r -FS ../wikimapper-chrome.zip * -x ".*"

echo "Bundles created successfully!"
