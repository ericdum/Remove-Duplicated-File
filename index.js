const { program } = require('commander');
const chalk = require('chalk');
const clearTheDir = require('./lib/clear');
const path = require('path'); 
const fs = require('fs-extra');

program
  .arguments('<targetDir> <trashDir>')
  .action(async function (targetDir, trashDir) {
    targetDir = await ensureDir(targetDir)
    trashDir = await ensureDir(trashDir, true)

    console.log(chalk.blue('[Start] to clean:'), targetDir, chalk.yellow('Save to: '+ trashDir))
    await clearTheDir(targetDir, trashDir)
  });

program.parse(process.argv);

async function ensureDir(dir, ensure){ 
  if (!path.isAbsolute(dir))
    dir = path.join(process.cwd(), dir);

  if (ensure) await fs.ensureDir(dir)
  var stats = fs.statSync(dir)
  if (!stats.isDirectory()) {
    return console.log(dir, chalk.red('is not a directory'))
  }
  return dir;
}
