FROM gcc:latest

RUN apt-get update && apt-get install -y \
    git \
    cmake \
    libboost-dev \
    libboost-regex-dev \
    libasio-dev 

WORKDIR /app
RUN git clone https://github.com/CrowCpp/Crow.git
WORKDIR /app/Crow
RUN mkdir build && cd build && cmake .. -DCROW_BUILD_EXAMPLES=OFF -DCROW_BUILD_TESTS=OFF && make install

WORKDIR /app

COPY . .
RUN g++  -o main main.cpp -lpthread -lmysqlclient -lstdc++

EXPOSE 7000


