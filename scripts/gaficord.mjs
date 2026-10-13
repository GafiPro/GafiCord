import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createPackage } from '@electron/asar';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const THEME_SOURCE = path.join(REPO_ROOT, 'themes', 'GafiCord.css');
const INJECTOR_SOURCE = path.join(REPO_ROOT, 'src', 'injector.cjs');
const APPDATA = process.env.APPDATA;
const LOCALAPPDATA = process.env.LOCALAPPDATA;
const GAFICORD_DIR = APPDATA ? path.join(APPDATA, 'GafiCord') : null;
const MANIFEST_PATH = GAFICORD_DIR ? path.join(GAFICORD_DIR, 'installations.json') : null;
const MARKER = 'GAFICORD_DESKTOP_INJECTOR_V1';

function sha256(file) {
    return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function readManifest() {
    if (!MANIFEST_PATH || !fs.existsSync(MANIFEST_PATH)) return { version: 1, installations: [] };
    const parsed = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    if (!Array.isArray(parsed.installations)) throw new Error('O ficheiro de instalações do GafiCord está inválido.');
    return parsed;
}

function saveManifest(manifest) {
    fs.mkdirSync(GAFICORD_DIR, { recursive: true });
    const temp = `${MANIFEST_PATH}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    fs.renameSync(temp, MANIFEST_PATH);
}

function compareVersions(a, b) {
    const va = (a.match(/\d+/g) || []).map(Number);
    const vb = (b.match(/\d+/g) || []).map(Number);
    for (let i = 0; i < Math.max(va.length, vb.length); i++) {
        const diff = (vb[i] || 0) - (va[i] || 0);
        if (diff !== 0) return diff;
    }
    return b.localeCompare(a);
}

function findDiscordInstall() {
    if (process.platform !== 'win32') {
        throw new Error('Este instalador é, nesta versão, apenas para Windows.');
    }
    if (!LOCALAPPDATA) throw new Error('A variável LOCALAPPDATA não está disponível.');

    const roots = ['Discord', 'DiscordPTB', 'DiscordCanary'];
    for (const name of roots) {
        const root = path.join(LOCALAPPDATA, name);
        if (!fs.existsSync(root)) continue;

        const versions = fs.readdirSync(root, { withFileTypes: true })
            .filter(entry => entry.isDirectory() && /^app-\d/i.test(entry.name))
            .map(entry => path.join(root, entry.name))
            .sort((a, b) => compareVersions(path.basename(a), path.basename(b)));

        for (const versionDir of versions) {
            const resourcesPath = path.join(versionDir, 'resources');
            const appAsar = path.join(resourcesPath, 'app.asar');
            if (fs.existsSync(appAsar)) {
                return { rootName: name, versionDir, resourcesPath, appAsar };
            }
        }
    }
    throw new Error('Não encontrei o Discord desktop em LOCALAPPDATA. Instalação Microsoft Store ou personalizada pode não ser suportada.');
}

function discordIsRunning() {
    const names = ['Discord.exe', 'DiscordPTB.exe', 'DiscordCanary.exe'];
    for (const name of names) {
        try {
            const output = execFileSync('tasklist', ['/FI', `IMAGENAME eq ${name}`, '/NH'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
            if (output.toLowerCase().includes(name.toLowerCase())) return true;
        } catch {
            // If tasklist cannot query this executable, continue to the next one.
        }
    }
    return false;
}

function ensureDiscordClosed() {
    if (discordIsRunning()) {
        throw new Error('Fecha completamente o Discord, incluindo o ícone junto ao relógio do Windows, e volta a executar o comando. Não vou terminar o processo à força.');
    }
}

function ensureDataFiles() {
    if (!APPDATA || !GAFICORD_DIR) throw new Error('A variável APPDATA não está disponível.');
    if (!fs.existsSync(THEME_SOURCE) || !fs.existsSync(INJECTOR_SOURCE)) {
        throw new Error('Faltam ficheiros do projeto. Volta a descarregar/clonar o repositório GafiCord.');
    }
    fs.mkdirSync(GAFICORD_DIR, { recursive: true });
    fs.copyFileSync(THEME_SOURCE, path.join(GAFICORD_DIR, 'theme.css'));
    fs.copyFileSync(INJECTOR_SOURCE, path.join(GAFICORD_DIR, 'injector.cjs'));
}

async function makeStubArchive(outputFile, loaderPath) {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gaficord-stub-'));
    const packageData = { name: 'discord', private: true, main: 'index.js' };
    const indexData = `// ${MARKER}\nrequire(${JSON.stringify(loaderPath)});\n`;
    try {
        fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageData, null, 2), 'utf8');
        fs.writeFileSync(path.join(tempDir, 'index.js'), indexData, 'utf8');
        await createPackage(tempDir, outputFile);
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}

async function install() {
    ensureDiscordClosed();
    ensureDataFiles();

    const target = findDiscordInstall();
    const manifest = readManifest();
    const previous = manifest.installations.find(item => item.resourcesPath === target.resourcesPath);
    const appAsar = target.appAsar;
    const backupAsar = path.join(target.resourcesPath, '_app.asar');
    const unpackedAsar = path.join(target.resourcesPath, 'app.asar.unpacked');
    const backupUnpacked = path.join(target.resourcesPath, '_app.asar.unpacked');
    const loaderPath = path.join(GAFICORD_DIR, 'injector.cjs');

    if (previous && fs.existsSync(appAsar) && fs.existsSync(backupAsar)) {
        const currentHash = sha256(appAsar);
        if (currentHash === previous.stubSha256) {
            console.log('GafiCord já está instalado nesta versão do Discord. O tema foi atualizado.');
            return;
        }
        throw new Error('Existe uma instalação registada, mas app.asar mudou. Por segurança, usa primeiro o comando restore.');
    }

    if (fs.existsSync(backupAsar) || fs.existsSync(backupUnpacked)) {
        throw new Error('Já existe _app.asar ou _app.asar.unpacked. Não vou sobrescrever ficheiros de outro modificador.');
    }

    const originalHash = sha256(appAsar);
    const tempAsar = path.join(target.resourcesPath, `app.gaficord-${process.pid}.asar`);
    let originalMoved = false;
    let unpackedMoved = false;
    let stubInstalled = false;

    try {
        await makeStubArchive(tempAsar, loaderPath);

        fs.renameSync(appAsar, backupAsar);
        originalMoved = true;

        if (fs.existsSync(unpackedAsar)) {
            fs.renameSync(unpackedAsar, backupUnpacked);
            unpackedMoved = true;
        }

        fs.renameSync(tempAsar, appAsar);
        stubInstalled = true;

        const record = {
            rootName: target.rootName,
            resourcesPath: target.resourcesPath,
            originalSha256: originalHash,
            stubSha256: sha256(appAsar),
            installedAt: new Date().toISOString()
        };
        manifest.installations = manifest.installations.filter(item => item.resourcesPath !== target.resourcesPath);
        manifest.installations.push(record);
        saveManifest(manifest);

        console.log('GafiCord instalado com sucesso.');
        console.log(`Discord detetado: ${target.versionDir}`);
        console.log('Tema local: ' + path.join(GAFICORD_DIR, 'theme.css'));
        console.log('Abre o Discord normalmente para aplicar o tema.');
        console.log('Para reverter, executa: npm run restore');
    } catch (error) {
        if (stubInstalled && fs.existsSync(appAsar)) fs.rmSync(appAsar, { force: true });
        if (unpackedMoved && fs.existsSync(backupUnpacked) && !fs.existsSync(unpackedAsar)) {
            fs.renameSync(backupUnpacked, unpackedAsar);
        }
        if (originalMoved && fs.existsSync(backupAsar) && !fs.existsSync(appAsar)) {
            fs.renameSync(backupAsar, appAsar);
        }
        if (fs.existsSync(tempAsar)) fs.rmSync(tempAsar, { force: true });
        throw error;
    }
}

function restore() {
    ensureDiscordClosed();
    const manifest = readManifest();
    if (manifest.installations.length === 0) {
        console.log('Não há instalações GafiCord registadas para restaurar.');
        return;
    }

    const remaining = [];
    for (const item of manifest.installations) {
        const resourcesPath = item.resourcesPath;
        const appAsar = path.join(resourcesPath, 'app.asar');
        const backupAsar = path.join(resourcesPath, '_app.asar');
        const unpackedAsar = path.join(resourcesPath, 'app.asar.unpacked');
        const backupUnpacked = path.join(resourcesPath, '_app.asar.unpacked');

        if (!fs.existsSync(backupAsar)) {
            console.warn(`Cópia original não encontrada; a ignorar: ${resourcesPath}`);
            remaining.push(item);
            continue;
        }
        if (!fs.existsSync(appAsar) || sha256(appAsar) !== item.stubSha256) {
            console.warn(`app.asar não corresponde ao GafiCord registado; não alterei: ${resourcesPath}`);
            remaining.push(item);
            continue;
        }
        if (fs.existsSync(backupUnpacked) && fs.existsSync(unpackedAsar)) {
            console.warn(`Existem duas pastas unpacked; não alterei: ${resourcesPath}`);
            remaining.push(item);
            continue;
        }

        fs.rmSync(appAsar, { force: true });
        fs.renameSync(backupAsar, appAsar);
        if (fs.existsSync(backupUnpacked) && !fs.existsSync(unpackedAsar)) {
            fs.renameSync(backupUnpacked, unpackedAsar);
        }
        console.log('Discord original restaurado: ' + resourcesPath);
    }

    manifest.installations = remaining;
    if (remaining.length === 0) {
        if (fs.existsSync(MANIFEST_PATH)) fs.rmSync(MANIFEST_PATH, { force: true });
        console.log('Restauração concluída. Os ficheiros pessoais do tema continuam em ' + GAFICORD_DIR);
    } else {
        saveManifest(manifest);
        console.warn('Algumas instalações não foram restauradas por segurança; consulta as mensagens acima.');
    }
}

function status() {
    const manifest = readManifest();
    if (manifest.installations.length === 0) {
        console.log('GafiCord não tem instalações registadas.');
        return;
    }
    for (const item of manifest.installations) {
        const appAsar = path.join(item.resourcesPath, 'app.asar');
        const actual = fs.existsSync(appAsar) ? sha256(appAsar) : null;
        console.log(`${actual === item.stubSha256 ? 'ATIVO' : 'PRECISA DE VERIFICAÇÃO'} — ${item.resourcesPath}`);
    }
}

async function main() {
    const command = process.argv[2] || 'status';
    if (command === 'install') return install();
    if (command === 'restore') return restore();
    if (command === 'status') return status();
    throw new Error('Comando desconhecido. Usa: install, restore ou status.');
}

main().catch(error => {
    console.error('\nErro: ' + error.message);
    process.exitCode = 1;
});
