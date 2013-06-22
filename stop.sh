#!/bin/bash
cd `dirname $BASH_SOURCE`
if [ -f server.pid ]
then
    pid=`cat server.pid`
    if ps -p $pid > /dev/null; then
        kill $pid
        while ps -p $pid > /dev/null; do
            sleep 0.2
        done
    fi
    rm -f server.err server.out server.pid
fi
