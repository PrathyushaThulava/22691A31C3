import React, { useState } from "react";
import { TextField, Button, Box, Typography, Grid } from "@mui/material";
import { log } from "./utils/logger";
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from "react-router-dom";

await log("frontend", "info", "api", "Shortened URL successfully");

const UrlForm = () => {
  const [longUrls, setLongUrls] = useState(["", "", "", "", ""]);
  const [shortenedUrls, setShortenedUrls] = useState([]);
  const [validity, setValidity] = useState("");
  const [customCode, setCustomCode] = useState(["", "", "", "", ""]);

  const handleChange = (index, value) => {
    const updatedUrls = [...longUrls];
    updatedUrls[index] = value;
    setLongUrls(updatedUrls);
  };

  const handleCodeChange = (index, value) => {
    const updatedCodes = [...customCode];
    updatedCodes[index] = value;
    setCustomCode(updatedCodes);
  };

  const handleShorten = async () => {
    try {
      const results = [];
      for (let i = 0; i < longUrls.length; i++) {
        const url = longUrls[i];
        if (url.trim() === "") continue;

        const body = {
          longUrl: url,
          validity: validity ? parseInt(validity) : 30,
        };

        if (customCode[i].trim()) {
          body.customCode = customCode[i].trim();
        }

        const res = await fetch("http://20.244.56.144/url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_LOG_TOKEN}`,
          },
          body: JSON.stringify(body),
        });

        const data = await res.json();
        results.push(data.shortUrl);

        await log("frontend", "info", "api", `Shortened ${url} -> ${data.shortUrl}`);
      }
      setShortenedUrls(results);
    } catch (error) {
      await log("frontend", "error", "api", `Shortening failed: ${error.message}`);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        URL Shortener
      </Typography>
      <TextField
        label="Default Validity (minutes)"
        variant="outlined"
        fullWidth
        value={validity}
        onChange={(e) => setValidity(e.target.value)}
        sx={{ mb: 2 }}
      />
      {longUrls.map((url, idx) => (
        <Grid container spacing={2} key={idx} sx={{ mb: 2 }}>
          <Grid item xs={8}>
            <TextField
              label={`URL ${idx + 1}`}
              variant="outlined"
              fullWidth
              value={url}
              onChange={(e) => handleChange(idx, e.target.value)}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Custom Code (Optional)"
              variant="outlined"
              fullWidth
              value={customCode[idx]}
              onChange={(e) => handleCodeChange(idx, e.target.value)}
            />
          </Grid>
        </Grid>
      ))}
      <Button variant="contained" color="primary" onClick={handleShorten}>
        Shorten URLs
      </Button>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Shortened URLs</Typography>
        {shortenedUrls.map((short, idx) => (
          <Typography key={idx}>
            <a href={short} target="_blank" rel="noopener noreferrer">{short}</a>
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

const Redirector = () => {
  const { code } = useParams();

  React.useEffect(() => {
    const fetchOriginal = async () => {
      try {
        const res = await fetch(`http://20.244.56.144/url/${code}`);
        const data = await res.json();
        window.location.href = data.longUrl;
      } catch (err) {
        await log("frontend", "error", "page", `Redirection failed for ${code}`);
      }
    };
    fetchOriginal();
  }, [code]);

  return <Typography>Redirecting...</Typography>;
};

const StatsPage = () => {
  const [stats, setStats] = useState([]);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://20.244.56.144/url/stats", {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_LOG_TOKEN}`,
          },
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        await log("frontend", "error", "page", "Failed to fetch statistics");
      }
    };
    fetchStats();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        URL Stats
      </Typography>
      {stats.map((entry, idx) => (
        <Box key={idx} sx={{ mb: 2 }}>
          <Typography>Short: {entry.shortUrl}</Typography>
          <Typography>Clicks: {entry.clicks}</Typography>
        </Box>
      ))}
    </Box>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UrlForm />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path=":code" element={<Redirector />} />
      </Routes>
    </Router>
  );
};

export default App;