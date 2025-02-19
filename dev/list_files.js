import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ignore from 'ignore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the source folder name
const SRC_FOLDER_NAME = 'src';
// Lista de pastas para ignorar
const FOLDERS_TO_IGNORE = ['.git', 'node_modules', 'vendors', 'images'];

function readGitignore(projectRoot) { // Take projectRoot as argument
    const gitignorePath = path.join(projectRoot, '.gitignore'); // Gitignore is at project root
    if (fs.existsSync(gitignorePath)) {
        const content = fs.readFileSync(gitignorePath, 'utf8');
        return ignore().add(content.split('\n'));
    }
    return ignore();
}

function shouldIgnore(item, relativePath, ig) {
    // Verifica se o item está na lista de pastas para ignorar
    if (FOLDERS_TO_IGNORE.includes(item)) {
        return true;
    }
    // Verifica se o item deve ser ignorado pelo .gitignore
    return ig.ignores(relativePath);
}

function listFiles(startDir, currentDir, ig) { // Removed level parameter
    let result = '';
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const relativePath = path.relative(startDir, fullPath); // Relative path from src

        // Usa a função shouldIgnore para verificar se deve ser ignorado
        if (shouldIgnore(item, relativePath, ig)) continue;

        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            result += `${relativePath}\\\n`; // Output full relative path for folder
            result += listFiles(startDir, fullPath, ig); // Recursive call, removed level + 1
        } else {
            result += `${relativePath}\n`; // Output full relative path for file
        }
    }

    return result;
}

function saveToFile(content, filename) {
    fs.writeFileSync(filename, content, 'utf8');
    console.log(`Resultado salvo em ${filename}`);
}

function main() {
    // 1) Always run from the folder src
    const scriptDirPath = __dirname; // Directory of the current script (project/scripts)
    const projectRoot = path.dirname(scriptDirPath); // Go up one level to project root
    const srcDirPath = path.join(projectRoot, SRC_FOLDER_NAME); // Path to the src folder (project/src)

    if (!fs.existsSync(srcDirPath)) {
        console.error(`Error: Folder '${SRC_FOLDER_NAME}' not found at: ${srcDirPath}`);
        return;
    }

    console.log(`Running script from src folder: ${srcDirPath}`);

    const outputFile = 'estrutura_pastas.txt';
    const ig = readGitignore(projectRoot); // Gitignore from project root
    const result = listFiles(srcDirPath, srcDirPath, ig); // Start listing from srcDir, removed level parameters

    saveToFile(result, outputFile);
    console.log(result);
}

main();