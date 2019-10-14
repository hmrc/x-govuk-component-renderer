#!/bin/sh

rm -Rf dependencies
mkdir dependencies

cd dependencies 
wget -O gds.tar.gz https://github.com/alphagov/govuk-design-system/tarball/master
mkdir govuk-design-system && tar xf gds.tar.gz -C govuk-design-system --strip-components 1
rm -f gds.tar.gz