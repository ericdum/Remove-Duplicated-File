const fs = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const walk = require('walkdir');
const compare = require('./compare');
const remove = require('./remove');

module.exports = async function(targetDir, trashDir){
  var result = await walk.async(targetDir, {
    return_object:true,
    find_links: false,
    follow_symlinks: true
  })
  console.log(chalk.blue('Found'), Object.keys(result).length, 'Files')
  var dumpFiles = await sameSize(result)
  await remove(dumpFiles, targetDir, trashDir);
}

/*
 * Step 1: Same Size
 * Step 2: Same MD%
 */
var sizeIndex = {};
async function sameSize(files) {
  var count=0, dumps=0;
  Object.keys(files).forEach(function(path){
    var file = files[path];
    if (file.isFile()) {
      count++;
      setSizeIndex(path, file.size);
    }
  })

  var md5Files = {};
  for (let size in sizeIndex) {
    if (sizeIndex[size].length>=2) {
      let result = await compare(sizeIndex[size]);
      for (let md5 in result) {
        if (result[md5].length>=2) {
          md5Files[md5] = result[md5]
        }
      }
    }
    delete sizeIndex[size]
  }

  return md5Files;
}

function setSizeIndex(path, size){
  if (!sizeIndex[size]) sizeIndex[size] = [path]
  else sizeIndex[size].push(path);
}
