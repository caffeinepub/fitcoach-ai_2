import { useEffect } from "react";

export function useNotifications(time: string) {
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!time) return;
    const [hours, minutes] = time.split(":").map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);

    const diff = target.getTime() - now.getTime();
    const timeout = setTimeout(() => {
      if (Notification.permission === "granted") {
        new Notification("FitCoach AI", {
          body: "Time to train! Your AI coach has prepared a workout for you.",
          icon: "/favicon.ico",
        });
      }
    }, diff);

    return () => clearTimeout(timeout);
  }, [time]);
}
