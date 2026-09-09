import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const INACTIVITY_LIMIT_MS = 10 * 60 * 1000; 
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

export default function SessionTimeout({ onTimeout }) {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  const handleLogout = useCallback(() => {

    onTimeout?.();
    navigate("/auth", { state: { reason: "session-expired" } });
  }, [navigate, onTimeout]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(handleLogout, INACTIVITY_LIMIT_MS);
  }, [handleLogout]);

  useEffect(() => {
    resetTimer(); 

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, resetTimer)
    );

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [resetTimer]);

  return null; 
}