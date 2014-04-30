#!/bin/bash

set -x
set -e

DIR='/aineisto/documents'

find $DIR -type f -name *.xml -print0 | xargs -0 sed -i 's/nbsp\;/#160\;/g'
find $DIR -type f -name *.xml -print0 | xargs -0 sed -i 's/middot\;/#183\;/g'
find $DIR -type f -name *.xml -print0 | xargs -0 sed -i 's/ndash\;/#8211\;/g'
find $DIR -type f -name *.xml -print0 | xargs -0 sed -i 's/mdash\;/#8212\;/g'
find $DIR -type f -name *.xml -print0 | xargs -0 sed -i 's/rsaquo\;/#8250\;/g'
find $DIR -type f -name *.xml -print0 | xargs -0 sed -i 's/lsaquo\;/#8249\;/g'
find $DIR -type f -name *.xml -print0 | xargs -0 sed -i 's/sup2\;/#178\;/g'
find $DIR -type f -name *.xml -print0 | xargs -0 sed -i 's/col http:/col /g'
find $DIR -type f -name *.xml -print0 | xargs -0 sed -i 's/row http:/row /g'
find $DIR -type f -name *.xml -print0 | xargs -0 sed -i 's/row localhost:18088/row /g'
find $DIR -type f -name *.xml -print0 | xargs -0 sed -i 's/image http:/image /g'
find $DIR -type f -name *.xml -print0 | xargs -0 sed -i 's/ x:str/ str/g'
find $DIR -type f -name *.xml -print0 | xargs -0 sed -i 's/ x:num/ num/g'
find $DIR -type f -name *.xml -print0 | xargs -0 sed -i 's/colstr/col str/g'
find $DIR -type f -name *.xml -print0 | xargs -0 sed -i 's/u1:fmla/u1-fmla/g'
find $DIR -type f -name *.xml -print0 | xargs -0 sed -i 's/row style:/row /g'
find $DIR -type f -name *.xml -print0 | xargs -0 sed -i 's/ Template:/ /g'
