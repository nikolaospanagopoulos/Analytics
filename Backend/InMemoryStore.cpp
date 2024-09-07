#include "InMemoryStore.hpp"
#include <mutex>

void InMemoryStore::incrementsessiondata(const std::string &sessionId,
                                         const std::string field,
                                         int incrementBy) {
  std::lock_guard<std::mutex> lock(storeMutex);
  std::get<int>(store[sessionId][field]) += incrementBy;
}

void InMemoryStore::deleteSession(const std::string &sessionId) {
  std::lock_guard<std::mutex> lock(storeMutex);
  store.erase(sessionId);
}
