#!/bin/bash

set -x
set -e

DIR='/aineisto/documents/pages26na'
echo "------------------------ 26 starts ---------------------------" >> xmllint.log
find $DIR -type f -name *.xml -print0 | xargs -0 xmllint --noout >> xmllint.log
DIR='/aineisto/documents/pages27na'
echo "------------------------ 27 starts ---------------------------" >> xmllint.log
find $DIR -type f -name *.xml -print0 | xargs -0 xmllint --noout >> xmllint.log
DIR='/aineisto/documents/pages28na'
echo "------------------------ 28 starts ---------------------------" >> xmllint.log
find $DIR -type f -name *.xml -print0 | xargs -0 xmllint --noout >> xmllint.log
