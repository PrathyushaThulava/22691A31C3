import React from "react";

const StatsPage = () => {
  const stats = JSON.parse(localStorage.getItem("shortenedUrls") || "[]");
  return (
    <div style={{ padding: "2rem" }}>
      <h2>Stats Page</h2>
      <ul>
        {stats.map((res, idx) => (
          <li key={idx}>
            {res.shortened} — Clicks: {res.clicks}, Valid for: {res.expiresIn}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StatsPage;