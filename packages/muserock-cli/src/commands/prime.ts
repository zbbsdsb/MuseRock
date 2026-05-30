#!/usr/bin/env node

import inquirer from 'inquirer';
import { spawn } from 'node:child_process';
import { writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { PrimeBrief } from '../storage/index.js';

export async function primeCommand(options: { edit?: boolean; file?: string }) {
  const cwd = process.cwd();
  
  if (options.edit) {
    await editMode(cwd, options.file);
  } else {
    await guidedMode(cwd, options.file);
  }
}

async function guidedMode(cwd: string, fileName?: string) {
  const primeFilePath = getPrimeFilePath(cwd, fileName);

  let existingBrief: PrimeBrief | null = null;
  if (existsSync(primeFilePath)) {
    try {
      const content = await readFile(primeFilePath, 'utf-8');
      existingBrief = JSON.parse(content);
    } catch {
    }
  }

  const { intent } = await inquirer.prompt([
    {
      type: 'editor',
      name: 'intent',
      message: 'What is your creative intent?',
      default: existingBrief?.intent || '',
    },
  ]);

  const constraints: string[] = [];
  let addMoreConstraints = true;
  while (addMoreConstraints) {
    const { constraint } = await inquirer.prompt([
      {
        type: 'input',
        name: 'constraint',
        message: 'Add a constraint (or leave blank to finish):',
      },
    ]);
    if (constraint.trim()) {
      constraints.push(constraint);
    } else {
      addMoreConstraints = false;
    }
  }

  const references: string[] = [];
  let addMoreReferences = true;
  while (addMoreReferences) {
    const { reference } = await inquirer.prompt([
      {
        type: 'input',
        name: 'reference',
        message: 'Add a reference (or leave blank to finish):',
      },
    ]);
    if (reference.trim()) {
      references.push(reference);
    } else {
      addMoreReferences = false;
    }
  }

  const primeBrief: PrimeBrief = {
    intent,
    constraints: constraints.length > 0 ? constraints : (existingBrief?.constraints || []),
    references: references.length > 0 ? references : (existingBrief?.references || []),
  };

  await savePrimeBrief(primeBrief, primeFilePath);
  console.log(`Prime brief saved to ${primeFilePath}`);
}

async function editMode(cwd: string, fileName?: string) {
  const primeFilePath = getPrimeFilePath(cwd, fileName);
  const tempPath = join(cwd, '.prime.tmp.md');

  let existingBrief: PrimeBrief | null = null;
  if (existsSync(primeFilePath)) {
    try {
      const content = await readFile(primeFilePath, 'utf-8');
      existingBrief = JSON.parse(content);
    } catch {
    }
  }

  const template = `# Prime Brief

## Intent
${existingBrief?.intent || ''}

## Constraints
${(existingBrief?.constraints || []).map(c => `- ${c}`).join('\n')}

## References
${(existingBrief?.references || []).map(r => `- ${r}`).join('\n')}
`;

  await writeFile(tempPath, template, 'utf-8');

  const editor = process.env.EDITOR || 'vim';
  await new Promise<void>((resolve, reject) => {
    const child = spawn(editor, [tempPath], {
      stdio: 'inherit' });
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Editor exited with code ${code}`));
      }
    });
  });

  const editedContent = await readFile(tempPath, 'utf-8');
  const parsedBrief = parseMarkdownToPrimeBrief(editedContent);

  await savePrimeBrief(parsedBrief, primeFilePath);

  const { unlink } = await import('node:fs/promises');
  await unlink(tempPath);
  console.log(`Prime brief saved to ${primeFilePath}`);
}

function getPrimeFilePath(cwd: string, fileName?: string): string {
  if (fileName) {
    return join(cwd, fileName);
  }
  const jsonPath = join(cwd, 'prime.json');
  if (existsSync(jsonPath)) {
    return jsonPath;
  }
  return join(cwd, 'prime.md');
}

async function savePrimeBrief(brief: PrimeBrief, filePath: string) {
  if (filePath.endsWith('.json')) {
    await writeFile(filePath, JSON.stringify(brief, null, 2), 'utf-8');
  } else {
    const markdown = `# Prime Brief

## Intent
${brief.intent}

## Constraints
${brief.constraints.map(c => `- ${c}`).join('\n')}

## References
${brief.references.map(r => `- ${r}`).join('\n')}
`;
    await writeFile(filePath, markdown, 'utf-8');
  }
}

function parseMarkdownToPrimeBrief(content: string): PrimeBrief {
  const lines = content.split('\n');
  let section: 'intent' | 'constraints' | 'references' | null = null;
  const brief: PrimeBrief = {
    intent: '',
    constraints: [],
    references: [],
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '## Intent') {
      section = 'intent';
    } else if (trimmed === '## Constraints') {
      section = 'constraints';
    } else if (trimmed === '## References') {
      section = 'references';
    } else if (trimmed.startsWith('#')) {
      section = null;
    } else if (section && trimmed) {
      if (section === 'intent') {
        brief.intent = trimmed;
      } else if (section === 'constraints' && trimmed.startsWith('- ')) {
        brief.constraints.push(trimmed.slice(2));
      } else if (section === 'references' && trimmed.startsWith('- ')) {
        brief.references.push(trimmed.slice(2));
      }
    }
  }

  return brief;
}
