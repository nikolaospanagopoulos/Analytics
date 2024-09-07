#include "ScopedDatabaseCon.hpp"
#include <iostream>
#include <mysql/mysql.h>
#include <stdexcept>

ScopedDatabaseCon::ScopedDatabaseCon() : con(mysql_init(NULL)) {
  if (!con) {
    throw std::runtime_error("MySQL initialization failed");
  }

  host = std::getenv("DB_HOST");
  user = std::getenv("DB_USER");
  password = std::getenv("DB_PASSWORD");
  database = std::getenv("DB_NAME");

  if (!host || !user || !password || !database) {
    throw std::runtime_error(
        "Database connection info missing from environment variables");
  }

  if (!mysql_real_connect(con, host, user, password, database, 0, NULL, 0)) {
    std::string error_msg = "Mysql Connection Failed: ";
    error_msg += mysql_error(con);
    throw std::runtime_error(error_msg);
  } else {
    std::cout << "Database connection Successful\n";
  }
}

ScopedDatabaseCon::~ScopedDatabaseCon() { mysql_close(con); }
MYSQL *ScopedDatabaseCon::getConnection() { return con; }
