import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import { log } from "../utils/logger";

const UrlForm = ({ results, setResults }) => {
  const [urls, setUrls] = useState([{ original: "", validity: "", shortcode: "" }]);

  const handleChange = (index, field, value) => {
    const newUrls = [...urls];
    newUrls[index][field] = value;
    setUrls(newUrls);
  };

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newResults = [...results];

    for (let i = 0; i < urls.length; i++) {
      const { original, validity, shortcode } = urls[i];
      if (!original || !validateUrl(original)) {
        alert(`Invalid URL at position ${i + 1}`);
        await log("frontend", "error", "page", "Invalid URL input");
        return;
      }
      const code = shortcode || Math.random().toString(36).substring(2, 8);
      const expiry = parseInt(validity) || 30;

      newResults.push({
        original,
        shortened: `http://localhost:3000/${code}`,
        expiresIn: `${expiry} minutes`,
        code,
        clicks: 0
      });
      await log("frontend", "info", "api", `Shortened URL generated: ${code}`);
    }
    setResults(newResults);
  };

  const addField = () => {
    if (urls.length < 5) {
      setUrls([...urls, { original: "", validity: "", shortcode: "" }]);
    }
  };

  const handleRedirect = async (code) => {
    const updated = results.map((res) => {
      if (res.code === code) {
        res.clicks += 1;
      }
      return res;
    });
    setResults(updated);
    await log("frontend", "info", "page", `Redirect clicked for: ${code}`);
    window.location.href = results.find((res) => res.code === code).original;
  };

  return (
    <Box sx={{ padding: "2rem" }}>
      <h2>URL Shortener</h2>
      <form onSubmit={handleSubmit}>
        {urls.map((url, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <TextField
              label="Long URL"
              fullWidth
              sx={{ mb: 1 }}
              value={url.original}
              onChange={(e) => handleChange(index, "original", e.target.value)}
            />
            <TextField
              label="Validity (minutes)"
              fullWidth
              sx={{ mb: 1 }}
              value={url.validity}
              onChange={(e) => handleChange(index, "validity", e.target.value)}
            />
            <TextField
              label="Custom Shortcode"
              fullWidth
              value={url.shortcode}
              onChange={(e) => handleChange(index, "shortcode", e.target.value)}
            />
          </Box>
        ))}
        {urls.length < 5 && (
          <Button onClick={addField} variant="outlined" sx={{ mr: 2 }}>
            Add Another URL
          </Button>
        )}
        <Button type="submit" variant="contained" color="primary">
          Shorten URLs
        </Button>
      </form>

      <Box sx={{ mt: 4 }}>
        <h3>Shortened URLs</h3>
        <ul>
          {results.map((res, idx) => (
            <li key={idx}>
              <strong
                style={{ cursor: "pointer", color: "blue" }}
                onClick={() => handleRedirect(res.code)}
              >
                {res.shortened}
              </strong> (expires in {res.expiresIn}, clicked {res.clicks} times)
            </li>
          ))}
        </ul>
      </Box>
    </Box>
  );
};

export default UrlForm;
