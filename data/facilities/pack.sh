#!/bin/sh

rm -fv ../geojsons.json

echo -n "{" >> ../geojsons.json

for file in *.geojson; do
	echo -n \"${file%.geojson}\":`jq -c . $file`, >> ../geojsons.json
done

truncate -s -1 ../geojsons.json
echo -n "}" >> ../geojsons.json
