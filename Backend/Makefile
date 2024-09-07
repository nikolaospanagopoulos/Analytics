OBJECTS=./build/ScopedDatabaseCon.o

all: ${OBJECTS}
	 g++  main.cpp ${OBJECTS} -lpthread -lmysqlclient -lstdc++  -o ./bin/main

./build/ScopedDatabaseCon.o:
	g++ ./ScopedDatabaseCon.cpp -c -o ./build/ScopedDatabaseCon.o

clean:
	rm ./bin/main
	rm -rf ${OBJECTS}

