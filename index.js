#!/usr/bin/env node
const chalk = require('chalk')
const semver = require('semver')
const requiredVersion = require('./package.json').engines.node
const { errorLog } = require('./lib/utils/log')

// 检查node版本
function checkNodeVersion (wanted, id) {
    if (!semver.satisfies(process.version, wanted)) {
        errorLog(
            'You are using Node ' + process.version + ', but this version of '+ id +
            ' requires Node ' + wanted + '.\nPlease upgrade your Node version.'
        )
        process.exit(1)
    }
}

checkNodeVersion(requiredVersion, 'ym-cli')

const program = require('commander')
const createCommands = require('./lib/core/create')

// 定义显示模块的版本号
program
    .version(require('./package.json').version)
    .usage('<command> [options]') // 打印的用户提示

// 创建命令
createCommands()

// 解析终端指令
program.parse(process.argv)