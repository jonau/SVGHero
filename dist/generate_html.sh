#!/bin/sh

echo '<!DOCTYPE html>' > "index.html"
echo '<html lang="en" class="no-js">' >> "index.html"
echo '<head>' >> "index.html"
echo '  <meta charset="UTF-8">' >> "index.html"
echo '  <meta name="viewport" content="width=device-width, initial-scale=1">' >> "index.html"
echo '' >> "index.html"
echo '  <link rel="stylesheet" href="bundle.css"/>' >> "index.html"
echo '</head>' >> "index.html"
echo '<body>' >> "index.html"
echo '  <div class="slide_set">' >> "index.html"
for file in $@; do
    echo '  <div class="slide">' >> "index.html"
    echo '      <object data="'"$file"'"></object>' >> "index.html"
    echo '  </div>' >> "index.html"
done
echo '    <div class="eventCatcher"/>' >> "index.html"
echo '  </div>' >> "index.html"
echo '  <script src="bundle.js" type="module"></script>' >> "index.html"
echo '</body>' >> "index.html"
echo '</html>' >> "index.html"