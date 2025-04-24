#!/bin/sh

rm -fv ./*.html

### 館名
awk -F '\t' 'NR > 1 { 
  filename = $1 ".html"; 
  printf("<div class=\"commons\">%s</div>\n", $2) > filename 
}'  < ../commons.tsv

### 出展者名
awk -F '\t' 'NR > 1 && $4 != "" {
  file = $4 ".html";
  print "<div class=\"exposition\">" >> file;
  print "  <span class=\"sign\">" $2 "</span>" >> file;
  print "  <span class=\"name_ja\">" $3 "</span>" >> file;
  print "</div>" >> file;
}'   < ../expositions.tsv

### JSON に統合
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
