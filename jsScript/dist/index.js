(() => {
  // index.js
  var localStorageSavedEvents = JSON.parse(localStorage.getItem("localStorageSavedEvents")) || {};
  function SessionData() {
    this.sessionId = getSessionId();
    this.startTime = localStorageSavedEvents.startTime || Date.now();
    this.lastVisibleTime = Date.now();
    this.url = window.location.href;
    this.totalTimeSpent = localStorageSavedEvents.totalTimeSpent || 0;
    this.isActiveTab = true;
    this.sessionStatus = "active";
    this.allClicks = localStorageSavedEvents?.allClicks || 0;
    this.elementsClicked = localStorageSavedEvents?.elementsClicked || {};
    this.scrollDepth = localStorageSavedEvents?.scrollDepth || 0;
  }
  var sessionData = new SessionData();
  SessionData.prototype.updateTimeSpent = function() {
    if (this.isActiveTab) {
      this.totalTimeSpent += Date.now() - this.lastVisibleTime;
    }
    this.lastVisibleTime = Date.now();
    localStorageSavedEvents.totalTimeSpent = this.totalTimeSpent;
    localStorage.setItem(
      "localStorageSavedEvents",
      JSON.stringify(localStorageSavedEvents)
    );
  };
  SessionData.prototype.getElementsClicked = function(e) {
    var elementIdentifier = e.target?.id ? `#${e.target.id}` : e.target?.className ? `.${e.target.className}` : `${e.target.tagName}`;
    if (this.elementsClicked[elementIdentifier]) {
      this.elementsClicked[elementIdentifier]++;
    } else {
      this.elementsClicked[elementIdentifier] = 1;
    }
    localStorageSavedEvents.elementsClicked = JSON.parse(
      JSON.stringify(this.elementsClicked)
    );
    localStorage.setItem(
      "localStorageSavedEvents",
      JSON.stringify(localStorageSavedEvents)
    );
  };
  SessionData.prototype.getScrollDepth = function() {
    this.scrollDepth = Math.max(this.scrollDepth, window.scrollY);
    localStorageSavedEvents.scrollDepth = this.scrollDepth;
    localStorage.setItem(
      "localStorageSavedEvents",
      JSON.stringify(localStorageSavedEvents)
    );
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      sessionData.isActiveTab = false;
      sessionData.updateTimeSpent();
    } else {
      sessionData.isActiveTab = true;
      sessionData.lastVisibleTime = Date.now();
    }
  });
  window.addEventListener("beforeunload", function() {
    sessionData.sessionStatus = "inactive";
    sessionData.updateTimeSpent();
    sendData(sessionData);
  });
  window.addEventListener("scroll", () => {
    sessionData.getScrollDepth();
  });
  document.body.addEventListener(
    "click",
    sessionData.getElementsClicked.bind(sessionData)
  );
  document.addEventListener("click", () => {
    sessionData.allClicks++;
    localStorageSavedEvents.allClicks = sessionData.allClicks;
    localStorage.setItem(
      "localStorageSavedEvents",
      JSON.stringify(localStorageSavedEvents)
    );
  });
  setInterval(() => {
    try {
      sessionData.updateTimeSpent();
      sendData(sessionData);
    } catch (e) {
      console.error("Failed to save data in localStorage");
    }
  }, 3e3);
  function sendData(data) {
    fetch("http://localhost:7000/send-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }).then((res) => res.json()).then((data2) => console.log(data2)).catch((err) => console.error("Failed to send data:", err));
  }
  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
  function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  function getSessionId() {
    var sessionId;
    if (!document.cookie.includes("session_id")) {
      sessionId = generateUUID();
      document.cookie = "session_id=" + sessionId + "; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT";
    } else {
      sessionId = getCookie("session_id");
    }
    return sessionId;
  }
})();
