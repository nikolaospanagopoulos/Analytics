#include "InMemoryStore.hpp"
#include "ScopedDatabaseCon.hpp"
#include <crow.h>
#include <crow/app.h>
#include <crow/http_request.h>
#include <crow/http_response.h>
#include <crow/middlewares/cors.h>
#include <mysql/mysql.h>
#include <thread>

int main() {

  InMemoryStore inMemoryStore;

  std::thread t1(&InMemoryStore::set<int>, &inMemoryStore, "session1", "clicks",
                 10);
  std::thread t2(&InMemoryStore::set<std::string>, &inMemoryStore, "session1",
                 "elements", "Hello");

  t1.join();
  t2.join();
  std::cout << "CLICKS: "
            << inMemoryStore.getSessionData<int>("session1", "clicks") << "\n";
  std::cout << "ELEMENTS: "
            << inMemoryStore.getSessionData<std::string>("session1", "elements")
            << "\n";

  /*
ScopedDatabaseCon scopedConnection;
crow::App<crow::CORSHandler> app;

auto &cors = app.get_middleware<crow::CORSHandler>();

cors.global()
.headers("X-Custom-Header", "Upgrade-Insecure-Requests")
.methods("POST"_method, "GET"_method)
.origin("http://127.0.0.1:8080")
.allow_credentials()
.headers("Accept", "Origin", "Content-Type", "Authorization", "Refresh");

CROW_ROUTE(app, "/send-data")
.methods("POST"_method)([](const crow::request &req) {
  auto x = crow::json::load(req.body);

  crow::json::wvalue responseBody({{"message", "Hello, World!"}});
  crow::response res{responseBody.dump()};
  res.code = 200;
  return res;
});

CROW_ROUTE(app, "/")
([]() {
return crow::response(
  200, "Successfully connected to MySQL database!(((())))!!!.");
});

app.port(7000).multithreaded().run();
*/

  return 0;
}
