const main = require('../src/generator');

(async function (args) {
  await main(args);
})((process.argv).slice(2))
