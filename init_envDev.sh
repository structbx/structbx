#!/bin/bash

BASEDIR="$PWD"

mkdir -p "$BASEDIR/build/Debug/DockerVolume" && \
mkdir -p "$BASEDIR/build/Debug/structbx-web-uploaded" && \
cd "$BASEDIR/build/Debug" && \
conan install ../../ --output-folder=./ --build=missing && \
cd "$BASEDIR" && \
cp conf/properties.yaml.template build/Debug/properties.yaml && \
cp conf/properties.yaml.template build/Debug/DockerVolume/properties.yaml && \
cp conf/cert.pem.template build/Debug/cert.pem && \
cp conf/cert.pem.template build/Debug/DockerVolume/cert.pem && \
cp conf/key.pem.template build/Debug/key.pem
cp conf/key.pem.template build/Debug/DockerVolume/key.pem