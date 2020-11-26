const chalk = require('chalk')

const hintLog = (...info) => {
    console.log(chalk.blue(info))
}

const successLog = (...info) => {
    console.log(chalk.green(info))
}

const errorLog = (...info) => {
    console.log(chalk.red(info))
}

const clearLog = () => {
    console.clear()
}

module.exports = {
    hintLog,
    successLog,
    errorLog,
    clearLog
}