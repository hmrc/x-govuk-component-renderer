#!/bin/sh

rm -rf "dependencies/$1"
mkdir -p dependencies

cd dependencies 

wget -O dep.tar.gz "$2" --retry-on-http-error=404

mkdir -p "$1" && tar xf dep.tar.gz -C "$1" --strip-components 1
rm -f dep.tar.gz

cd "$1"
echo "$3" > version.txt
