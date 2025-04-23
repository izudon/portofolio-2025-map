#!/bin/sh

rm -fv ../index.json

echo -n "{" >> ../index.json

for file in *.geojson; do
	echo -n \"${file%.geojson}\":`jq -c . $file`, >> ../index.json
done

truncate -s -1 ../index.json
echo -n "}" >> ../index.json
