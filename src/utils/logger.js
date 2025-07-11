// src/utils/logger.js

export const log = async (stack, level, pkg, message) => {
  try {
    const res = await fetch("http://20.244.56.144/evaluation-service/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_LOG_TOKEN}`,
      },
      body: JSON.stringify({
        stack: stack.toLowerCase(),
        level: level.toLowerCase(),
        package: pkg.toLowerCase(),
        message,
      }),
    });

    const data = await res.json();
    console.log("Logged:", data);
  } catch (err) {
    console.error("Logging failed:", err.message);
  }
};