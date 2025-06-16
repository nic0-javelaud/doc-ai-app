# Document AI Helper

This is a tool to help you configure DocAI to extract data from pdfs and output it in a structured format. It is still very much a prototype at this point and missing a lot of features.

## Use cases

- Perform adhoc document extraction through a GUI.
- Provide a side-by-side environment to demo markdown/json data.

## Getting started

First make sure you have Node.js installed. If not you can download it from [here](https://nodejs.org/en/download/).

Then download the project, install the dependencies and start a development server...

```bash
git clone https://github.com/nic0-javelaud/doc-ai-app.git
cd doc-ai-app && npm install
npm run dev -- --open

```

## Setting your API Key

The very first step is to paste in your API key. No functionality will work without it.

## Adhoc extractions

Move to the config tab to configure your processor. You can then upload a pdf and see the results in the output tab.

> For now the app only supports `string`, `number` and `boolean` types. It also doesn't support nested objects yet (but it will soon).

## Markdown/JSON demo

The application checks for files in `/src/lib/assets/demo/json` and `/static/demo/images` to display them in the side-by-side demo tab.

It's a bit wonky but you need to drop the json files in the `json` folder and the images in the `images` folder. The images need to have the same name as the json files. The format for the json files are the exact output from the REST API endpoint (see sample included).

> When uploading a document make sure to stay within the limits defined in the documentation.


