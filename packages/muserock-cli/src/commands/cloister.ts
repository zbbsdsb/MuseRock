#!/usr/bin/env node

import inquirer from 'inquirer';
import { spawn } from 'node:child_process';
import { writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { defaultStorage, PrimeBrief } from '../storage/index.js';

export async function cloisterCommand() {
  const cwd = process.cwd();
  
  const existingCloister = await loadCloister(cwd);
  
  displayPrimeContext();
  
  const editor = process.env.EDITOR;
  
  if (editor) {
    await editMode(cwd, existingCloister, editor);
  } else {
    await promptMode(cwd, existingCloister);
  }
}

function displayPrimeContext() {
  console.log('=== Current Prime Context ===\n');
  
  const cwd = process.cwd();
  const primeFilePath = join(cwd, 'prime.md');
  const primeJsonPath = join(cwd, 'prime.json');
  
  let primeContent: PrimeBrief | null = null;
  
  if (existsSync(primeJsonPath)) {
    try {
      const content = readFileSync(primeJsonPath, 'utf-8');
      primeContent = JSON.parse(content);
    } catch {
    }
  } else if (existsSync(primeFilePath)) {
    try {
      const content = readFileSync(primeFilePath, 'utf-8');
      primeContent = parsePrimeMarkdown(content);
    } catch {
    }
  }
  
  if (primeContent) {
    console.log('Intent:', primeContent.intent || '(none)');
    if (primeContent.constraints && primeContent.constraints.length > 0) {
      console.log('\nConstraints:');
      primeContent.constraints.forEach(c => console.log(`- ${c}`));
    }
    if (primeContent.references && primeContent.references.length > 0) {
      console.log('\nReferences:');
      primeContent.references.forEach(r => console.log(`- ${r}`));
    }
  } else {
    console.log('No prime context found in current directory.');
  }
  
  console.log('\n=== Cloister Mode ===\n');
}

async function editMode(cwd: string, existingContent: string, editor: string) {
  const tempPath = join(cwd, 'cloister.md');
  
  let contentToEdit = existingContent;
  if (!contentToEdit.trim()) {
    contentToEdit = `# Cloister

This is your cloister space for deep reflection and creative work.

Write your thoughts, ideas, and creative content here.`;
  }
  
  await writeFile(tempPath, contentToEdit, 'utf-8');
  
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
  await saveCloister(cwd, editedContent);
  
  console.log('Cloister saved successfully.');
}

async function promptMode(cwd: string, existingContent: string) {
  const { content } = await inquirer.prompt([
    {
      type: 'editor',
      name: 'content',
      message: 'Write your cloister content:',
      default: existingContent || '',
    },
  ]);
  
  await saveCloister(cwd, content);
  console.log('Cloister saved successfully.');
}

function getCloisterFilePath(cwd: string): string {
  return join(cwd, 'cloister.md');
}

async function loadCloister(cwd: string): Promise<string> {
  const filePath = getCloisterFilePath(cwd);
  if (existsSync(filePath)) {
    try {
      return await readFile(filePath, 'utf-8');
    } catch {
    }
  }
  return '';
}

async function saveCloister(cwd: string, content: string) {
  const filePath = getCloisterFilePath(cwd);
  await writeFile(filePath, content, 'utf-8');
  
  const projectFiles = await defaultStorage.listProjects();
  for (const projectId of projectFiles) {
    const project = await defaultStorage.loadProject(projectId);
    if (project) {
      project.cloister = {
        content,
        lastEditAt: new Date().toISOString()
      };
      await defaultStorage.saveProject(project);
    }
  }
}

function readFileSync(path: string, encoding: string): string {
  const fs = require('fs');
  return fs.readFileSync(path, encoding);
}

function parsePrimeMarkdown(content: string): PrimeBrief {
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
