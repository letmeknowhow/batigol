#! /usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');
const ArgumentParser = require('argparse').ArgumentParser;
const rekitPkgJson = require('../package.json');
const createApp = require('./createApp');

const parser = new ArgumentParser({
  version: rekitPkgJson.version,
  addHelp: true,
  allowAbbrev: false,
  description: 'Build web applications with React, Redux and React-router.'
});

const subparsers = parser.addSubparsers({
  title: 'Sub commands',
  dest: 'commandName',
});

// Create project
const createCmd = subparsers.addParser('create',
  {
    addHelp: true,
    description: 'Create a new react project.',
  }
);

createCmd.addArgument('name', {
  help: 'The project name',
});

const args = parser.parseArgs();

switch (args.commandName) {
  case 'create':
    createApp(args);
    break;
  default:
    console.log('Error');
    process.exit(1);
    break;
}
