#!/bin/bash

BASEDIR="$PWD"

# Create build directories
mkdir -p "$BASEDIR/build/Debug"

# Verify if exists build directories
if [ ! -d "$BASEDIR/build/Debug" ]; then
    echo "Error: Failed to create build/Debug directory."
    exit 1
fi

# install dependencies with conan
cd "$BASEDIR/build/Debug"
conan install ../../ --output-folder=./ --build=missing
cd "$BASEDIR"