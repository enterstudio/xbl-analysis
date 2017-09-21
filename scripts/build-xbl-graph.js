
var fs = require('fs');
var sortedBindings = require('./sorted-bindings');
var {getParsedFiles} = require('./xbl-files');
var prettier = require("prettier");
var data = {};

function countForRev(rev) {
  console.log(`Looking at ${rev}`);
  return getParsedFiles(rev).then(files => {
    let numBindings = files.map(file => {
      return file.doc.find('binding').length;
    }).reduce((a, b) => { return a + b; });
    let loc = files.map(file => {
      return file.body.split(/\n/).length;
    }).reduce((a, b) => { return a + b; });
    let label = rev.match(/@{(.*)}/)[1];

    data[rev] = {
      numBindings,
      loc,
      label
    };
  });
}

let revs = [
  'master@{2017-03-01}',
  'master@{2017-04-01}',
  'master@{2017-06-01}',
  'master@{2017-06-01}',
  'master@{2017-07-01}',
  'master@{2017-08-01}',
  'master@{2017-09-01}',
];

Promise.all(
  revs.map(rev => {
    return countForRev(rev);
  })
).then(() => {
  for (var rev of revs) {
    console.log(rev, data[rev]);
  }

  fs.writeFileSync('graph/xbl-counts.js', prettier.format(`
    var DATA = ${JSON.stringify(data)};
  `));
});
