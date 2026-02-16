# Server (Smart Recipe Generator)

## Image Ingredient Detection via OpenAI

This server can analyze uploaded ingredient photos using OpenAI Vision.

### Configure

1. Create `server/.env` with:
   ```env
   OPENAI_API_KEY=your-openai-api-key
   ```
2. Install dependencies and start:
   ```bash
   cd server
   npm install
   npm start
   ```

### Test the endpoint

Use PowerShell to test detection:

```powershell
$bytes = [System.IO.File]::ReadAllBytes("path\\to\\image.jpg")
Invoke-RestMethod -Uri "http://localhost:5000/analyze-image" -Method Post -ContentType "multipart/form-data" -InFile "path\\to\\image.jpg"
```

The endpoint responds with:

```json
{ "detected": ["tomato", "onion"], "raw": "model response" }
```

### Notes

- The detector restricts outputs to ingredient names found in `recipes.json` to reduce false positives.
- If `OPENAI_API_KEY` is missing, the endpoint returns `501` with guidance.
