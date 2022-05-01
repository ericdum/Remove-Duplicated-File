const fs = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const walk = require('walkdir');
const compare = require('./compare');
const remove = require('./remove');
const ProgressBar = require('progress');

var showProcessFiles = false;
var skipKnownSizes = 0;
var doit = false;
var keep = false;
module.exports = async function(targetDir, trashDir, options){
  showProcessFiles = !!options.V;
  skipKnownSizes = options.skip || 0;
  doit = options.doit;
  keep = options.keep;
  var result = await walk.async(targetDir, {
    return_object:true,
    find_links: false,
    follow_symlinks: true,
    filter: (p, files) => {
      return files.filter((file)=>{
        return ['@eaDir', '.mounted', '.DS_Store'].indexOf(file)==-1
      })
    }
  })
  console.log(chalk.blue('Found'), Object.keys(result).length, 'Files')
  await sameSize(result, targetDir, trashDir)
}

/*
 * Step 1: Same Size
 * Step 2: Same MD%
 */
var sizeIndex = {};
async function sameSize(files, targetDir, trashDir) {
  var bar = new ProgressBar(chalk.blue('Size comparing [:bar] :current/:total :percent | completed in :etas'), {
    complete: '=',
    incomplete: ' ',
    width: 50,
    total: Object.keys(files).length
  });

  var count=0, dumps=0;
  Object.keys(files).forEach(function(path){
    var file = files[path];
    if (file.isFile()) {
      count++;
      setSizeIndex(path, file.size);
    }
  })

  var sameSize = {}
  for (let size in sizeIndex) {
    if (sizeIndex[size].length>=2) {
      sameSize[size] = sizeIndex[size]
    }
  }

  console.log(Object.keys(sameSize).length, chalk.blue('files in the same size'))

  bar = new ProgressBar(chalk.blue('MD5 comparing & move [:bar] :current/:total :percent '), {
    complete: '=',
    incomplete: ' ',
    width: 50,
    total: Object.keys(sameSize).length
  });

  //var md5Files = {};
  var i = 0;
  for (let size in sameSize) {
    if (i++ < skipKnownSizes) {
      bar.tick();
      continue;
    }
    bar.interrupt('comparing MD5 within: ' + sameSize[size].length + ' files, with each ' + (Math.round(size/1024)/1024) + 'MB')
    let result = await compare(sameSize[size]);
    for (let md5 in result) {
      if (result[md5].length>=2) {
        //md5Files[md5] = result[md5]
        keep && sort(result[md5]);
        showProcessFiles && bar.interrupt(chalk.red(JSON.stringify(result[md5])))
        doit && await remove(result[md5], targetDir, trashDir);
      } else {
        showProcessFiles && bar.interrupt(chalk.green(JSON.stringify(result[md5])))
      }
    }
    bar.tick()
  }

  return //md5Files;
}

function setSizeIndex(path, size){
  if (!sizeIndex[size]) sizeIndex[size] = [path]
  else sizeIndex[size].push(path);
}

function sort(files) {
  for (var i=0; i<files.length; i++) {
    if (files[i].indexOf(keep) != -1) {
      let file = files[i]
      files.splice(i, 1);
      files.unshift(file);
      return;
    }
  }
}
