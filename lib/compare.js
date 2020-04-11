const crypto = require('crypto');
const fs = require('fs');

function computedHex(file) {
  return new Promise((reslove) => {
    let rs = fs.createReadStream(file);
    let hash = crypto.createHash('md5');
    let hex;
    let base64 = '';
    rs.on('data', function(chunk){
      hash.update(chunk)
      base64 += chunk.toString('base64');
    });

    rs.on('end', function() {
        hex = hash.digest('hex')
        reslove(hex);
    });
  });
}

module.exports = async function(files) {
  var index = {};
  for (let i in files) {
    let file = files[i]
    setIndex(file, await computedHex(file))
  }

  for (let md5 in index) {
    if (index[md5].length < 2) delete index[md5]
  }

  return index;

  function setIndex(path, hex){
    if (!index[hex]) index[hex] = [path]
    else index[hex].push(path);
  }
}

