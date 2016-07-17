FROM golang:1.5

RUN apt-get install -y git nano

RUN mkdir -p $GOPATH/src/github.com/hyperhq/
RUN cd $GOPATH/src/github.com/hyperhq/ && git clone https://github.com/hyperhq/hypercli hypercli
RUN cd $GOPATH/src/github.com/hyperhq/hypercli && ./build.sh

