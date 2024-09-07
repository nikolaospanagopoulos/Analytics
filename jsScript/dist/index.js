(() => {
  // index.js
  var localStorageSavedEvents = JSON.parse(
    localStorage.getItem("localStorageSavedEvents")
  ) ? JSON.parse(localStorage.getItem("localStorageSavedEvents")) : {};
  function SessionData() {
    this.sessionId = getSessionId();
    this.allClicks = localStorageSavedEvents?.allClicks || 0;
    this.userAgent = navigator.userAgent;
    this.startTime = localStorageSavedEvents.startTime || Date.now();
    this.elementsClicked = localStorageSavedEvents?.elementsClicked || {};
    this.scrollDepth = localStorageSavedEvents?.scrollDepth || 0;
    this.timeSpent = localStorageSavedEvents?.timeSpent || 0;
  }
  var sessionData = new SessionData();
  SessionData.prototype.calculateTimeSpent = function calculateTimeSpent() {
    localStorageSavedEvents.startTime = this.startTime;
    this.intervalToCalculateDuration = setInterval(() => {
      this.timeSpent = Date.now() - this.startTime;
      localStorageSavedEvents.timeSpent = this.timeSpent;
    }, 1e3);
  };
  sessionData.calculateTimeSpent();
  fetch("http://localhost:7000/send-data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ data: true })
  }).then((res) => {
    return res.json();
  }).then((data) => console.log(data));
  SessionData.prototype.getElementsClicked = function getElementsClicked(e) {
    var elementIdentifier = e.target?.id ? `#${e.target.id}` : e.target?.className ? `.${e.target.className}` : `${e.target.tagName}`;
    if (this.elementsClicked[elementIdentifier]) {
      this.elementsClicked[elementIdentifier]++;
    } else {
      this.elementsClicked[elementIdentifier] = 1;
    }
    localStorageSavedEvents.elementsClicked = JSON.parse(
      JSON.stringify(this.elementsClicked)
    );
  };
  SessionData.prototype.getScrollDepth = function getScrollDepth() {
    this.scrollDepth = Math.max(this.scrollDepth, window.scrollY);
    localStorageSavedEvents.scrollDepth = this.scrollDepth;
  };
  window.addEventListener("storage", function(event) {
    localStorageSavedEvents = JSON.parse(event.newValue);
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
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      clearInterval(sessionData.intervalToCalculateDuration);
      console.log("Stopping!!!!");
    } else {
      console.log("continuing");
      setInterval(() => {
        sessionData.timeSpent = Date.now() - sessionData.startTime;
        localStorageSavedEvents.timeSpent = sessionData.timeSpent;
      }, 1e3);
    }
  });
  window.addEventListener("beforeunload", function() {
  });
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
  setInterval(() => {
    try {
      localStorage.setItem(
        "localStorageSavedEvents",
        JSON.stringify(localStorageSavedEvents)
      );
    } catch (e) {
      console.error("failed to save data in localStorage");
    }
  }, 3e3);
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
