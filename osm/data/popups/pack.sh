#!/bin/sh

rm -fv ../popups.json

echo -n "{" >> ../popups.json

for file in *.html; do
	echo -n \"${file%.html}\": >> ../popups.json
	jq -Rs . < $file           >> ../popups.json
	truncate -s -1                ../popups.json
	echo -n ,                  >> ../popups.json
done

truncate -s -1 ../popups.json
echo -n "}" >> ../popups.json
