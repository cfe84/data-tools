#!/usr/bin/env node

const fs = require("fs");
const { spawn } = require("node:child_process");

const dbName = process.argv[2] || ":memory:";

function filesToCmd(mode, files) {
    if (files.length === 0) {
        return "";
    }
    const subcommands = files.map(file => [`-cmd`, `.import ${file} ${file.substring(0, file.length - 4)}`]).flat();
    return ['-cmd', `.mode ${mode}`, ...subcommands];
}

const dir = process.cwd();
const files = fs.readdirSync(dir);
const csvFiles = files.filter(file => file.endsWith(".csv"));
const tsvFiles = files.filter(file => file.endsWith(".tsv"));
const csvCommand = filesToCmd("csv", csvFiles);
const tsvCommand = filesToCmd("tabs", tsvFiles);
const parameters = [dbName, ...csvCommand, ...tsvCommand, '-batch', '']
const out = spawn('sqlite3.exe', parameters);
out.stdout.on('data', data => {
    console.log(`stdout:\n${data}`);
});

out.stderr.on('data', data => {
    console.error(`stderr: ${data}`);
});

out.on('error', (error) => {
    console.error(`error: ${error.message}`);
  });
  
out.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
});