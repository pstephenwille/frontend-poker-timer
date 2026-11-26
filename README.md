# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-rea fct-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Running locally against a backend stage

`pnpm dev` serves the app on `http://localhost:3333` and proxies `/api` to the backend stage set in `VITE_API_ORIGIN`. `.env.development` sets it to `dev`, and a git-ignored `.env.development.local` overrides it with your personal stage:

```sh
# .env.development.local
VITE_API_ORIGIN=https://<personal-stage-url>
```

Signing in from localhost only works against a personal stage deployed for it. Cognito sends sign-in back to one origin per stage, and `dev` and `prod` send it back to their own CloudFront address, not to localhost. Against `dev`, data reads work, but Sign in ends on the `dev` site with "Sign-in took too long", because the sign-in cookie was set for localhost.

To sign in locally, make localhost your personal stage's app origin, deploy it, then point the proxy at it:

1. In `backend-poker-timer`, create `.env.<your-name>` beside `sst.config.ts` containing `LOCAL_FRONTEND_ORIGIN=http://localhost:3333`. SST loads it for every deploy of that stage, and git ignores it.
2. Deploy: `pnpm sst deploy --stage <your-name>`.
3. Here, set `VITE_API_ORIGIN` in `.env.development.local` to the stage's URL, and update it after each deploy that changes the URL. Restart `pnpm dev` to pick it up.

`vite.config.ts` reads the URL with Vite's `loadEnv`, because Vite loads `.env` files into `import.meta.env` only after the config has run. Vite reads the files in this order, and each later file overrides earlier ones:

1. `.env`
2. `.env.local`
3. `.env.[mode]` (`.env.development` for `pnpm dev`)
4. `.env.[mode].local`

Variables already set in the shell override every file. Git ignores `*.local` files here.

- Use Chrome or Firefox. Safari won't keep the `Secure` session cookie on `http://localhost`.
- While the stage is deployed this way, its own CloudFront address can't sign in. Rename or delete `.env.<your-name>` and deploy again to switch back.
- The backend README's "Serve a local frontend dev server from a personal stage" has the details.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
