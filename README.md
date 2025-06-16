# Document AI Helper

This is a tool to help you configure DocAI to extract data from pdfs and output it in a structured format. It is still very much a prototype at this point and missing a lot of features.

## Use cases

    - Perform adhoc document extraction through a GUI.
    - Provide a side-by-side environment to demo markdown/json data.

## Getting started

First make sure you have Node.js installed. If not you can download it from [here](https://nodejs.org/en/download/).

Then start by downloading the project and installing the dependencies...

```bash
# download project locally.
git clone https://github.com/
# Install dependencies
cd doc-ai-app && npm install
```

## Serving the app locally

Once the dependencies are installed, start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
