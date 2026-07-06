#!/bin/bash

# Set current directory
source_dir="${PWD}"

# Create build directory
build_dir='./build'
if [ -d $build_dir ]; then
    echo "- Delete old build directory: ${build_dir}"
    rm -r $build_dir
fi

echo "- Create building folder: ${build_dir}"
mkdir $build_dir

echo "- Entering folder: ${build_dir}"
cd $build_dir

# Configure
echo "- Configure"
cmake ../ -DCMAKE_BUILD_TYPE=Release
if [ "$?" != "0" ]; then
    exit -1
fi

# Build
echo "- Build"
cmake --build .
if [ "$?" != "0" ]; then
    exit -1
fi

# Go back to the current directory
cd $source_dir