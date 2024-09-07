#include "ScopedDatabaseCon.hpp"
#include <crow.h>
#include <crow/app.h>
#include <crow/http_request.h>
#include <crow/http_response.h>
#include <crow/middlewares/cors.h>
#include <cstdlib> // For getenv
#include <mysql/mysql.h>

int main() {
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

  return 0;
}
