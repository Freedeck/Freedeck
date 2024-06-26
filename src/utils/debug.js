const fs = require('fs');
const path = require('path');
const os = require('os');

const dbg = {
  status: process.argv.includes('--debug'),
  mode: 'Debug',
  setMode: (k) => dbg.mode = k,
  writeLogs: true,
  log: (v, k='_unset') => {
    let strToBuild = '';
    if (k !== '_unset') strToBuild += `[${k}] `;
    strToBuild += `${v}`;
    if (dbg.status) console.secretDebugLogNoWriteToFileOnlyDoIfYouKnowWhatYoureDoing(strToBuild);
    if (dbg.writeLogs) {
      fs.appendFile(path.resolve('./FreedeckCore.log'), `D{${Date.now()}} ${strToBuild}\n`, (err) => {
        if (err) console.error(err);
      });
    }
  },
};

console._log = console.log;
console.secretDebugLogNoWriteToFileOnlyDoIfYouKnowWhatYoureDoing = (...e) => console._log(...e);
console.log = (...e) => {
  console._log(...e);
  if (!dbg.writeLogs) return;
  const rebuilt = [];
  e.forEach((item) => {
    item = item.replace(os.homedir(), '(User\'s homedir)');
    rebuilt.push(item);
  });
  fs.appendFile(path.resolve('./FreedeckCore.log'), `C{${Date.now()}} ${rebuilt.join(',')}\n`, (err) => {
    if (err) console.error(err);
  });
};

module.exports = dbg;
