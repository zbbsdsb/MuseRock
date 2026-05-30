#!/usr/bin/env node

import { Command } from 'commander';
import { primeCommand } from './commands/prime.js';
import { cloisterCommand } from './commands/cloister.js';

const program = new Command();

program
  .name('muserock')
  .description('MuseRock CLI tool')
  .version('0.1.0');

program
  .command('prime')
  .description('Create or edit a prime brief')
  .option('-e, --edit', 'Edit in your default editor')
  .option('-f, --file <file>', 'Specify the file name')
  .action(primeCommand);

program
  .command('cloister')
  .description('Enter cloister mode for deep reflection')
  .action(cloisterCommand);

program.parse();
