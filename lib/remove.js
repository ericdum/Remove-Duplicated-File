const fs = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const readline = require('readline');
const ProgressBar = require('progress');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var MARK = "-|-";
module.exports = async function moveFiles(dumpFiles, targetDir, trashDir){
  var tasks = [];
  //for (let md5 in dumpFiles) {
    //let files = dumpFiles[md5];
    for (let i=1; i<dumpFiles.length; i++) {
      tasks.push(dumpFiles[i]);
    }
  //}
  //console.error(tasks)
  //console.error(chalk.red('Ready to DELETE'), tasks.length, 'File(s)')
  if (!tasks.length) return process.exit(0);
  for (let i in tasks) {
    let file = tasks[i];
    let dest = path.join(trashDir, path.relative(targetDir, file))
    //await sleep(1000)
    await fs.move(file, dest);
  }
  return;

  rl.question(chalk.blue('Enter ok to continue:'), async (answer) => {
    rl.close();
    if (answer != 'ok') return console.log(chalk.red('Aborted!'));
    var bar = new ProgressBar(chalk.red('Removing [:bar] :current/:total :percent | completed in :etas'), {
      complete: '=',
      incomplete: ' ',
      width: 50,
      total: tasks.length
    });

  });
}

function sleep(ms){
  return new Promise(function(resolve){
    setTimeout(resolve, ms)
  })
}

function replaceAll(str, find, replace) {
  var find = find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  return str.replace(new RegExp(find, 'g'), replace);
}
