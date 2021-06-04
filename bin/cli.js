let program = require('commander');
const pkg = require('../package.json');
const chalk = require('chalk');

program
    .version(pkg.version, '-v, --version')
    .description(chalk(`[ ${pkg.description} - ${pkg.version.toUpperCase()} ]`).green);

program
    .command('rm <dest> [otherDirs...]')
    .alias('r')
    .option('-r, --recursive', 'Remove recursively')
    .option('-d --drink [drink]', 'Drink', 'Beer')
    .action(function (d, otherD, cmd) {
        console.log('remove ' + d, (cmd.drink), (cmd.recursive));
        if (otherD) {
            otherD.forEach(function (oDir) {
                console.log('rmdir %s', oDir);
            });
        }

    });

program.parse(process.argv);
