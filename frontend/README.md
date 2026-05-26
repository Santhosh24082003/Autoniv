# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  # Vapi receptionist test page

  This frontend is a small React page for launching the Vapi browser widget and testing the receptionist flow without building a full app.

  ## Setup

  Create a `.env` file in `frontend` with your public key:

  ```env
  VITE_VAPI_PUBLIC_KEY=your_public_key_here
  VITE_VAPI_ASSISTANT_ID=d855826e-eabd-4707-813c-ad214268ab3b
  ```

  ## Run

  ```bash
  npm install
  npm run dev
  ```

  ## What it does

  - Loads the Vapi web widget in the browser
  - Uses the assistant ID you provided
  - Sends captured leads to `https://autoniv-n8q9.onrender.com/vapi/lead`

