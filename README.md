# Document AI Helper

This is a tool to help you configure DocAI to extract data from pdfs and output it in a structured format. It is still very much a prototype at this point and missing a lot of features.

## Use cases

- Perform adhoc document extraction through a GUI.
- Provide a side-by-side environment to demo markdown/json data.

## Getting started

First make sure you have Node.js installed. If not you can download it from [here](https://nodejs.org/en/download/).

Then download the project, install the dependencies, build the app and start a local preview server...

```bash
git clone https://github.com/nic0-javelaud/doc-ai-app.git
cd doc-ai-app && npm install
npm run build
npm run preview -- --open
```

> Once built next time you need to run the app you can just run `npm run preview -- --open` or `npm run dev -- --open` to start a local dev server.

## Setting your API Key

The very first step is to paste in your API key. No functionality will work without it.

## Adhoc extractions

Move to the config tab to configure your processor. You can then upload a pdf and see the results in the output tab.

> For now the app only supports `string`, `number` and `boolean` types. It also doesn't support nested objects yet (but it will soon).

## Markdown/JSON demo

The application checks for files in `/src/lib/assets/demo/json` and `/static/demo/images` to display them in the side-by-side demo tab.

It's a bit wonky but you need to drop the json files in the `json` folder and the images in the `images` folder. The images need to have the same name as the json files. The format for the json files are the exact output from the REST API endpoint (see sample included).

> When uploading a document make sure to stay within the limits defined in the documentation.

# Document AI Playground – Release Notes

## Version 1.1 (Latest)
### New Features & Improvements

**Enhanced API Error Handling**: Fixed error handling for smoother API interactions, with clearer on-screen notifications.
**Save/Load Configurations**: Save extraction job setups to local storage and reload them later for efficiency.
**AI-Powered Suggestions**: Leverage Medium 3 to auto-suggest extraction configurations.
**OCR-Only Mode**: Added a toggle for OCR-only jobs (no extraction).
**Improved Exports**: Results now download as files (replacing clipboard copy).

### UI/UX Updates
Reorganized schema config section to include:
- OCR mode toggle
- Config suggestions
- Save/Load controls

## Version 1.0.1
### Quality-of-Life Updates

**On-Screen Notifications**: Real-time feedback for actions (e.g., job completion, errors).
**Curl Command Export**: Copy ready-to-use Curl commands to clipboard for API testing.

## Version 1.0 (Initial Release)
### Core Features

**Ad-Hoc Extraction Setup**: Configure jobs via a dedicated screen.
**Schema Management**: Add/delete attributes (define types, arrays, descriptions) and custom schemas.
**Result Visualization**: Side-by-side comparison of **Markdown** and **structured data** outputs.
**Demo Environment**: Test with local folders containing JSON files + documents.
**Data Export**: Copy raw JSON results to clipboard (updated in v1.1 to file downloads).
