'use strict';

/*
 * GafiCord local CSS loader.
 * This file only reads a local stylesheet and applies it to Discord renderer
 * windows. It does not access credentials, tokens, messages, or network APIs.
 */

const fs = require('node:fs');
const path = require('node:path');
const { app } = require('electron');

const resourcesPath = process.resourcesPath;
const originalAsar = path.join(resourcesPath, '_app.asar');
const dataRoot = path.join(process.env.APPDATA || app.getPath('appData'), 'GafiCord');
const cssPath = path.join(dataRoot, 'theme.css');
const logPath = path.join(dataRoot, 'injector.log');

function log(message) {
    try {
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${message}\n`, 'utf8');
    } catch {
        // Logging must never prevent Discord from starting.
    }
}

if (!fs.existsSync(originalAsar)) {
    throw new Error('[GafiCord] Original Discord archive _app.asar was not found. Run the restore command.');
}

function isDiscordUrl(value) {
    return /^https?:\/\/(?:[^/]+\.)?discord\.com(?:\/|$)/i.test(value)
        || /^discord:\/\//i.test(value);
}

function attachStyle(window) {
    const webContents = window.webContents;
    if (!webContents || webContents.isDestroyed()) return;

    const apply = () => {
        try {
            const url = webContents.getURL();
            if (!isDiscordUrl(url) || !fs.existsSync(cssPath)) return;

            const css = fs.readFileSync(cssPath, 'utf8');
            Promise.resolve(webContents.insertCSS(css))
                .then(() => log('Applied GafiCord CSS to Discord renderer.'))
                .catch(error => log(`CSS injection failed: ${error.message}`));
        } catch (error) {
            log(`Could not apply theme: ${error.message}`);
        }
    };

    webContents.on('dom-ready', apply);
    webContents.on('did-finish-load', apply);
}

app.on('browser-window-created', (_event, window) => attachStyle(window));

const originalPackage = require(path.join(originalAsar, 'package.json'));
const originalMain = path.join(originalAsar, originalPackage.main || 'index.js');

if (!fs.existsSync(originalMain)) {
    throw new Error(`[GafiCord] Original Discord entry point not found: ${originalMain}`);
}

// Preserve paths that the original Electron application expects.
app.setAppPath(originalAsar);
if (require.main) {
    require.main.filename = originalMain;
    require.main.path = path.dirname(originalMain);
}

log('Loading the original Discord application with GafiCord CSS enabled.');
require(originalMain);
