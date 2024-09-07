#pragma once
#include <cstdlib> // For getenv
#include <mysql/mysql.h>

class ScopedDatabaseCon {
public:
  ScopedDatabaseCon();
  ~ScopedDatabaseCon();

  MYSQL *getConnection();

private:
  MYSQL *con;
  const char *host;
  const char *user;
  const char *password;
  const char *database;
};
