# Poker Timer frontend

React and TypeScript, built and served with Vite. `@vitejs/plugin-react` provides Fast Refresh on top of Vite's hot module replacement.

## Running locally against a backend stage

`pnpm dev` serves the app on `http://localhost:3333` and proxies `/api` to the backend set by `VITE_API_ORIGIN` in 
`.env.development` or `.env.development.local`, the later overrides it with your personal stage url:

Signing in from localhost only works against a personal stage deployed for it. Cognito sends the sign-in req back to 
one origin per stage. `dev` and `prod` send it back to their own CloudFront address, not to localhost. 

To sign in locally, make localhost your personal stage's app origin, deploy it, then point the proxy at it:

1. In `backend-poker-timer`, create `.env.<your-name>` at project root, containing 
   `LOCAL_FRONTEND_ORIGIN=http://localhost:3333`. SST loads it and git ignores it.
2. Deploy: `pnpm sst deploy --stage <your-name>`.
3. Copy the `url` from that commands output
3. Come back here, set `VITE_API_ORIGIN` to the URL output from the `sst deploy` command in `.env.development.local`
4. Restart `pnpm dev` to pick it up.


```sh
# .env.development.local
VITE_API_ORIGIN=https://<personal-stage-url>
```



`vite.config.ts` reads the URL with Vite's `loadEnv`, because Vite loads `.env` files into `import.meta.env` only after the config has run. Vite reads the files in this order, and each later file overrides earlier ones:

1. `.env`
2. `.env.local`
3. `.env.[mode]` (`.env.development` for `pnpm dev`)
4. `.env.[mode].local`

Variables already set in the shell override every file. Git ignores `*.local` files here.

- Use Chrome or Firefox. Safari won't keep the `Secure` session cookie on `http://localhost`.
- While the stage is deployed this way, its own CloudFront address can't sign in. Rename or delete `.env.<your-name>` and deploy again to switch back.
- The backend README's "Serve a local frontend dev server from a personal stage" has the details.
