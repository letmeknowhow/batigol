#! /usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');
const ArgumentParser = require('argparse').ArgumentParser;
const rekitPkgJson = require('../package.json');
const createApp = require('./createApp');

// If runs under a project
function getLocalRekitCore() {
  let cwd = process.cwd();
  let lastDir = null;
  let prjRoot = null;
  // Traverse above until find the package.json.
  while (cwd && lastDir !== cwd) {
    if (fs.existsSync(path.join(cwd, 'package.json'))) {
      prjRoot = cwd;
      break;
    }
    lastDir = cwd;
    cwd = path.join(cwd, '..');
  }

  const pkgJson = prjRoot ? path.join(prjRoot, 'package.json') : null;
  if (!prjRoot || !fs.existsSync(pkgJson)) return null;
  else {
    const pj = require(pkgJson);
    if (!(pj.devDependencies && pj.devDependencies['rekit-core'] || pj.dependencies && pj.dependencies['rekit-core'])) {
      return null;
    }
  }
  return require('./core');
}

const rekitCore = getLocalRekitCore();

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

if (rekitCore) {
  rekitCore.plugin.getPlugins(rekitCore).forEach((p) => {
    if (p.config.defineArgs) p.config.defineArgs(addCmd);
  });
}

const args = parser.parseArgs();

console.log('args');
console.log(args);
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
    // rekitCore.vio.flush();
    break;
}
