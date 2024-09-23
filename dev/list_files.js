import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ignore from 'ignore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lista de pastas para ignorar
const FOLDERS_TO_IGNORE = ['.git', 'node_modules', 'vendors', 'images'];

function readGitignore(dir) {
    const gitignorePath = path.join(dir, '.gitignore');
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

function listFiles(startDir, currentDir, level = 0, ig) {
    let result = '';
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const relativePath = path.relative(startDir, fullPath);

        // Usa a função shouldIgnore para verificar se deve ser ignorado
        if (shouldIgnore(item, relativePath, ig)) continue;

        const stats = fs.statSync(fullPath);
        const prefix = '-'.repeat(level);

        if (stats.isDirectory()) {
            result += `${prefix}${item}/\n`;
            result += listFiles(startDir, fullPath, level + 1, ig);
        } else {
            result += `${prefix}${item}\n`;
        }
    }

    return result;
}

function saveToFile(content, filename) {
    fs.writeFileSync(filename, content, 'utf8');
    console.log(`Resultado salvo em ${filename}`);
}

function main() {
    const targetDir = process.argv[2] || process.cwd();
    const outputFile = 'estrutra_pastas.txt';
    const ig = readGitignore(targetDir);
    const result = listFiles(targetDir, targetDir, 0, ig);
    
    saveToFile(result, outputFile);
    console.log(result);
}

main();