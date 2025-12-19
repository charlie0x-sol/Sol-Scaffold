#!/usr/bin/env node

import { Command } from 'commander';

import { newCommand } from './commands/new.js';

import { listCommand } from './commands/list.js';

import { doctorCommand } from './commands/doctor.js';

import { cleanCommand } from './commands/clean.js';

import { syncCommand } from './commands/sync.js';



const program = new Command();



program

  .name('sol-scaffold')

  .description('A CLI to scaffold common DeFi primitives on Solana')

  .version('0.1.0');



program.addCommand(newCommand);

program.addCommand(listCommand);

program.addCommand(doctorCommand);

program.addCommand(cleanCommand);

program.addCommand(syncCommand);



program.parse(process.argv);


