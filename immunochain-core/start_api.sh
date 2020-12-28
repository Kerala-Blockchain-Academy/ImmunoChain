#!/usr/bin/env bash
python ./rabbit_queue/consumer1.py &
python ./rabbit_queue/consumer2.py &
# python ./rabbit_queue/consumer3.py &

if [ -n "$1" ]
    then
        sed -i -e "s/localhost/$1/g" server_config.py &
fi
python server.py
