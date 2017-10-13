FROM tlodge/node-red-app-webserver-base
MAINTAINER Tom Lodge <tlodge@gmail.com>
WORKDIR /root

ADD static static
ADD views views
COPY build/bundle.js index.js
COPY conf/start.sh /root
RUN chmod a+x /root/start.sh

#add the latest node-red databox nodes
WORKDIR /data/nodes
RUN git clone https://github.com/tlodge/databox-nodered-nodes.git databox
RUN cd /data/nodes/databox && npm install