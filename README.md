# AI Study Notes Generator — Vercel deployment

This is the same app, restructured to run on Vercel:

```
vercel-repo/
  index.html        - the frontend (served automatically at "/")
  api/generate.js    - serverless function (served automatically at "/api/generate")
  package.json
```

Vercel runs `api/generate.js` as an on-demand serverless function
instead of one always-on server. Your API key is set as a Vercel
**environment variable**, not a `.env` file — it lives on Vercel's
servers only, never in the browser or in your GitHub repo.

## Deploy steps

1. Push this folder's contents to a GitHub repo (or reuse your existing one —
   just make sure `index.html`, `api/`, and `package.json` are at the repo root,
   or set Vercel's "Root Directory" to wherever they live).

2. Go to https://vercel.com → sign in with GitHub.

3. Click **Add New... -> Project** → import your repo.

4. Before deploying, expand **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `AI_PROVIDER` | `anthropic` (or `gemini` / `openai`) |
   | `AI_API_KEY` | your real API key |

5. Click **Deploy**. Vercel builds it and gives you a public URL like
   `https://your-project.vercel.app` — anyone can open that and use the
   app immediately, no key or setup needed on their end.

## Updating the key later

Project → Settings → Environment Variables → edit `AI_API_KEY` →
redeploy (Vercel prompts you, or push any small commit to trigger it).

## Notes

- No `npm install` step is required — the function only uses the
  built-in `fetch`, available in Vercel's Node 18+ runtime.
- Cold starts: serverless functions "sleep" between requests, so the
  first generate after a while can take a couple of seconds longer.
  This is normal and free-tier expected behavior.
