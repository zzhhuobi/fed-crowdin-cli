let program = require('commander');
const pkg = require('../package.json');
const chalk = require('chalk');
const Crowdin = require('../lib/crowdin');

program
    .usage('fed-crowdin-cli')
    .version(pkg.version, '-v, --version')
    .description(chalk(`[ ${pkg.description} - ${pkg.version} ]`).green);

program
    .command('pull [lang]')
    .description('Pull translations. When there are no parameters, pull all translations.')
    .action(function (args,otherArgs,cmd) {
        const crowdin = new Crowdin();
        console.log(cmd.args);
        crowdin.pull(cmd.args);
    });

program.parse(process.argv);
