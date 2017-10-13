#!/bin/sh
cd /root/
node index.js &
cd /usr/src/node-red && npm start -- --userDir /data