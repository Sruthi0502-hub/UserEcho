(function() {
    console.log("Analytics Tracker Initialized");
    const ENDPOINT = "http://localhost:8000/api/track";
    
    function generateSessionId() {
        let sid = sessionStorage.getItem("analytics_session_id");
        if (!sid) {
            sid = "sess_" + Math.random().toString(36).substr(2, 9) + Date.now();
            sessionStorage.setItem("analytics_session_id", sid);
            // Track session start
            trackEvent("session_start");
        }
        return sid;
    }

    function trackEvent(type, extra={}) {
        const sid = sessionStorage.getItem("analytics_session_id") || generateSessionId();
        
        const payload = {
            session_id: sid,
            url: window.location.href,
            event_type: type,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent
        };

        // Merge extra
        // Pydantic doesn't accept flexible dict in the root schema I defined unless I add it.
        // My schema was: attributes defined explicitely.
        // So I will ignore extra meta for now or maybe add it to schemas if I want strict validation.
        // I won't send 'meta' for now to avoid validation 422.

        fetch(ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        }).catch(err => console.error("Tracking Error:", err));
    }

    // Initialize
    generateSessionId();

    // Track Pageview
    trackEvent("pageview");

    // Track Clicks
    document.addEventListener("click", (e) => {
        // Simplified: event_type = click
        trackEvent("click");
    });

    // Session End
    window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === 'hidden') {
             // reliable enough for session end approximation?
             // Or just let backend infer session end by timeout.
             // Requirement: "Collect session end"
             const payload = {
                session_id: sessionStorage.getItem("analytics_session_id"),
                url: window.location.href,
                event_type: "session_end",
                timestamp: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(payload)], {type: 'application/json'});
            navigator.sendBeacon(ENDPOINT, blob);
        }
    });

})();
