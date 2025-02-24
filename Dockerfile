FROM ghcr.io/nebulaatom/nebulaatom:latest AS build

RUN apt-get update && apt-get install -y \
    make \
    binutils \
    g++ \
    git \
    cmake \
    libssl-dev \
    libpoco-dev \
    libmariadb-dev \
    libyaml-cpp-dev

WORKDIR /usr/src/structbx

COPY . /usr/src/structbx

RUN mkdir build && cd build && \
    cmake ../ -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/structbx && \
    cmake --build . && \
    cmake --build . --target install && \
    git clone https://github.com/structbx/structbx-web.git

FROM ghcr.io/nebulaatom/nebulaatom:latest

COPY --from=build /structbx /structbx

COPY --from=build /usr/src/structbx/build/structbx-web /var/www/structbx-web

COPY --from=build /usr/src/structbx/conf/*.pem /structbx/etc/structbx/

WORKDIR /structbx

RUN mkdir -p /var/www/structbx-web-uploaded && \
    touch /var/log/structbx.log

# ENTRYPOINT ["/structbx/bin/structbx-server", "--config /structbx/etc/structbx/properties.yaml"]