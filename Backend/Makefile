OBJECTS=./build/ScopedDatabaseCon.o ./build/InMemoryStore.o

all: ${OBJECTS}
	 g++  main.cpp ${OBJECTS} -lpthread -lmysqlclient -lstdc++  -o ./bin/main

./build/ScopedDatabaseCon.o:
	g++ ./ScopedDatabaseCon.cpp -c -o ./build/ScopedDatabaseCon.o
./build/InMemoryStore.o:
	g++ ./InMemoryStore.cpp -c -o ./build/InMemoryStore.o

clean:
	rm ./bin/main
	rm -rf ${OBJECTS}

