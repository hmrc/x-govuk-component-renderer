#!/bin/sh

echo ">>>" "$0" "$1" "$2" "$3" "$4"

rm -rf "$4/dependencies/$1"
mkdir -p "$4/dependencies"

cd "$4/dependencies"

wget --retry-connrefused --waitretry=1 --read-timeout=20 --timeout=15 -t 0 -O dep.tar.gz "$2"

mkdir -p "$1" && tar xf dep.tar.gz -C "$1" --strip-components 1
rm -f dep.tar.gz

cd "$1"
echo "$3" > version.txt
echo "$0" "$1" "$2" "$3" "$4" > command.txt
