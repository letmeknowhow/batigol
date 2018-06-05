#! /usr/bin/env node
'use strict';

// Summary:
//  Build scalable web applications with React, Redux and React-router.
// Usage:
//  rekit action [...args]

const path = require('path');
const fs = require('fs');
const rekitCore = require('rekitCore');
const ArgumentParser = require('argparse').ArgumentParser;
const rekitPkgJson = require('../package.json');
const createApp = require('./createApp');

const parser = new ArgumentParser({
  version: rekitPkgJson.version,
  addHelp: true,
  allowAbbrev: false,
  description: 'Build scalable web applications with React, Redux and React-router.'
});

const subparsers = parser.addSubparsers({
  title: 'Sub commands',
  dest: 'commandName',
});

// Create project
const createCmd = subparsers.addParser('create',
  {
    addHelp: true,
    description: 'Create a new Rekit project.',
  }
);

createCmd.addArgument('name', {
  help: 'The project name',
});

createCmd.addArgument(['--sass'], {
  help: 'Use sass rather than less.',
  action: 'storeTrue',
});

createCmd.addArgument(['--clean', '-c'], {
  help: 'Create a clean app without sample actions/pages.',
  action: 'storeTrue',
});

createCmd.addArgument(['--template', '-t'], {
  help: 'Which template to use for creating a project. Clone from "https://github.com/supnate/rekit-boilerplate-${template} Default to cra (create-react-app). If it\'s rekit. Then use supnate/rekit-boilerplate.',
  defaultValue: 'cra',
});

// Add sub-command
const addCmd = subparsers.addParser('add',
  {
    addHelp: true,
    description: 'Add an element to the project.',
  }
);

addCmd.addArgument('type', {
  help: 'The type of the element to add.'
});

addCmd.addArgument('name', {
  help: 'The element name to add, in format of <feature>/<name>, e.g.: \'rekit add component user/list-view\'. <name> is unnecessary if add a feature.'
});

addCmd.addArgument(['--connect', '-c'], {
  help: 'Whether to connect to the Redux store. Only used for component.',
  action: 'storeTrue',
});

addCmd.addArgument(['--url-path', '-u'], {
  help: 'The url path added to react router config. Only used for page/component.',
  dest: 'urlPath',
});

addCmd.addArgument(['--async', '-a'], {
  help: 'Whether the action is async using redux-thunk.',
  action: 'storeTrue',
});

// Remove sub-command
const rmCmd = subparsers.addParser('remove',
  {
    aliases: ['rm'],
    addHelp: true,
    description: 'Remove an element from the project.',
  }
);

rmCmd.addArgument('type', {
  help: 'The type of the element to remove.'
});

rmCmd.addArgument('name', {
  help: 'The element name to remove, in format of <feature>/<name>, e.g.: \'rekit remove component user/list-view\'. Name is unnecessary if remove a feature.'
});

// Move sub-command
const mvCmd = subparsers.addParser('move',
  {
    aliases: ['mv'],
    addHelp: true,
    description: 'Move or rename an element.',
  }
);

mvCmd.addArgument('type', {
  help: 'The type of the element to move.'
});

mvCmd.addArgument('source', {
  help: 'The source element to move, in format of <feature>/<name>, e.g.: \'rekit move component user/list-view employee/list\'. Name is unnecessary if move a feature.'
});

mvCmd.addArgument('target', {
  help: 'The target element to reach, in format of <feature>/<name>, e.g.: \'rekit move component user/list-view employee/list\'. Name is unnecessary if move a feature.'
});

if (rekitCore) {
  rekitCore.plugin.getPlugins(rekitCore).forEach((p) => {
    if (p.config.defineArgs) p.config.defineArgs(addCmd, mvCmd, rmCmd);
  });
}

const args = parser.parseArgs();

console.time('😃  Done');
// Convert aliases
const aliases = { rm: 'remove', mv: 'move' };
Object.keys(aliases).forEach((k) => {
  if (args.commandName === k) {
    args.commandName = aliases[k];
  }
});

switch (args.commandName) {
  case 'create':
    // Only create command is handled rekit
    createApp(args);
    break;
  default:
    // Other command are handled by rekit-core
    if (!rekitCore) {
      console.log('Error: please ensure rekit-core is installed for the project.');
      process.exit(1);
    }
    rekitCore.handleCommand(args);
    rekitCore.vio.flush();
    console.timeEnd('😃  Done'); // create command doesn't need time end.
    break;
}
