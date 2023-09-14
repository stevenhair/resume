# resume

You can view the web version at https://resume.steve.hair or [download the PDF](https://resume.steve.hair/resume.pdf).

## Installation
This résumé is defined with [JSON Resume](https://jsonresume.org/). To render the résumé, you need Node.js 10 or higher.
Run `npm install` in this directory to install dependencies.

## Generation
* To generate a PDF, run `npm run build:pdf`
* To generate an HTML file, run `npm run build:html`
* ~~To open a browser and watch for file changes, run `npm start`~~ (note: this functionality is broken with YAML, but fixed by [this PR](https://github.com/jsonresume/resume-cli/pull/722))
