#include "InMemoryStore.hpp"
#include "ScopedDatabaseCon.hpp"
#include <condition_variable>
#include <crow.h>
#include <crow/app.h>
#include <crow/http_request.h>
#include <crow/http_response.h>
#include <crow/middlewares/cors.h>
#include <iostream>
#include <mutex>
#include <mysql/mysql.h>
#include <queue>
#include <thread>

std::queue<crow::json::rvalue> taskQueue;
std::mutex queueMutex;
std::condition_variable condition;

bool isRunning = true;

void workerThread(InMemoryStore &store) {
  while (isRunning) {
    std::unique_lock<std::mutex> lock(queueMutex);

    condition.wait(lock, [] { return !taskQueue.empty() || !isRunning; });

    while (!taskQueue.empty()) {
      auto task = std::move(taskQueue.front());
      taskQueue.pop();
      lock.unlock();

      std::string sessionId = task["sessionId"].s();

      std::cout << "Written to memory store: " << sessionId << std::endl;

      lock.lock();
    }
  }
}

int main() {
  InMemoryStore inMemoryStore;

  std::thread t1(workerThread, std::ref(inMemoryStore));
  std::thread t2(workerThread, std::ref(inMemoryStore));
  std::thread t3(workerThread, std::ref(inMemoryStore));

  ScopedDatabaseCon scopedConnection;
  crow::App<crow::CORSHandler> app;

  auto &cors = app.get_middleware<crow::CORSHandler>();

  cors.global()
      .headers("X-Custom-Header", "Upgrade-Insecure-Requests")
      .methods("POST"_method, "GET"_method)
      .origin("http://127.0.0.1:8080")
      .allow_credentials()
      .headers("Accept", "Origin", "Content-Type", "Authorization", "Refresh");

  // POST request handler
  CROW_ROUTE(app, "/send-data")
      .methods("POST"_method)([](const crow::request &req) {
        auto x = crow::json::load(req.body);
        if (!x) {
          return crow::response(400, "Invalid JSON");
        }

        {
          std::lock_guard<std::mutex> lock(queueMutex);
          taskQueue.push(std::move(x));
        }
        condition.notify_one();

        crow::json::wvalue responseBody({{"message", "Task received!"}});
        crow::response res{responseBody.dump()};
        res.code = 200;
        return res;
      });

  // GET request handler
  CROW_ROUTE(app, "/")
  ([]() {
    return crow::response(
        200, "Successfully connected to MySQL database!(((())))!!!.");
  });

  app.port(7000).multithreaded().run();

  isRunning = false;
  condition.notify_all();
  t1.join();
  t2.join();
  t3.join();

  return 0;
}
