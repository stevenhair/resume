#!/usr/bin/env node

import parseArgs from 'minimist';
import * as themeFull from 'jsonresume-theme-full';
import { readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util'
import puppeteer from 'puppeteer'
import * as resumed from 'resumed';
import schema from 'resume-schema';
import YAML from 'yaml';

const HELP_TEXT = `
  Usage
    $ ${process.argv[1]} [--format FORMAT] [OUTPUT_FILE]

  Arguments
    OUTPUT_FILE     The filename of the output (default: resume.{FORMAT}, e.g. resume.pdf)

  Options
    --format        Output format (default: pdf, options: pdf, html)
    -h, --help      Show this message
`;
const RESUME_INPUT_FILE = 'resume.yml';

const schemaValidate = promisify(schema.validate)

async function readResume(resumeFile) {
    const inputFileContents = (await readFile(resumeFile)).toString();
    return YAML.parse(inputFileContents);
}

async function renderAsHtml(resume, theme) {
    return resumed.render(resume, theme);
}

async function renderAsPdf(resume, theme) {
    const html = await renderAsHtml(resume, theme);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'letter', printBackground: true });
    await browser.close();

    return pdf;
}

async function validate(resume) {
    try {
        await schemaValidate(resume);
    } catch (e) {
        console.error(`Invalid resume: ${e[0].message} at ${e[0].path}`);
    }
}

async function writeToFile(filename, contents) {
    await writeFile(filename, contents);
}

async function main() {
    const args = parseArgs(process.argv.slice(2), { boolean: ['h', 'help']})

    if (args.h || args.help) {
        console.log(HELP_TEXT);
        return;
    }

    const format = args.format?.toLowerCase() ?? 'pdf';
    const outputPath = args._[0] ?? `resume.${format}`;

    const resume = await readResume(RESUME_INPUT_FILE);
    await validate(resume);

    const theme = themeFull;
    let output;

    switch (format) {
        case 'html':
            output = await renderAsHtml(resume, theme);
            break;
        case 'pdf':
            output = await renderAsPdf(resume, theme);
            break;
        default:
            console.error(`Invalid output format "${format}`);
            process.exit(1);
    }

    await writeToFile(outputPath, output);
}

await main();
