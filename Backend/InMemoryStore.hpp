#pragma once
#include <mutex>
#include <string>
#include <unordered_map>
#include <variant>

using VariantTypeValue = std::variant<int, std::string>;

class InMemoryStore {
private:
  std::unordered_map<std::string,
                     std::unordered_map<std::string, VariantTypeValue>>
      store;
  std::mutex storeMutex;

public:
  // will check later if we can reference
  template <typename T>
  void set(const std::string &sessionId, const std::string field, T value) {
    std::lock_guard<std::mutex> lock(storeMutex);
    store[sessionId][field] = value;
  }
  void deleteSession(const std::string &sessionId);
  void incrementsessiondata(const std::string &sessionId,
                            const std::string field, int incrementBy);
  template <typename T>
  T getSessionData(const std::string &sessionId, const std::string field) {

    std::lock_guard<std::mutex> lock(storeMutex);
    if (store[sessionId].find(field) != store[sessionId].end()) {
      if constexpr (std::is_same_v<T, std::string>) {
        return std::get<std::string>(store[sessionId][field]);
      } else {
        return std::get<int>(store[sessionId][field]);
      }
    } else {
      if constexpr (std::is_same_v<T, int>) {
        return (-1);
      } else {
        return "-1";
      }
    }
  }
};
