const { promisify } = require('util')
const { resolve, relative } = require('path')
const { prompt } = require('inquirer')
const chalk = require('chalk')
const downloadRepo = promisify(require('download-git-repo'))
const ora = require('ora')
const open = require('open')
const validateProjectName = require('validate-npm-package-name')
const { program } = require('commander')
const fs = require('fs-extra')

const { successLog, errorLog, hintLog } = require('../utils/log');
const { vueGitRepo } = require('../config/repo-config')
const tplList = require('../config/templates')
const { spawn } = require('../utils/terminal')
const { ejsCompile, writeFile, mkdirSync } = require('../utils/utils')
const { logWithSpinner, stopSpinner } = require('../utils/spinner')

const createProject = async (projectName, options) => {
  const cwd = process.cwd() //后期提供配置选项
  const isCurrent = projectName === '.'
  // 如果项目名字是 "." 那么就会直接在当前文件夹下生成内容，这个特点解决了先在 gitlab 上创建好项目，然后再在本地生成项目内容的需求
  const name = isCurrent ? relative('../', cwd) : projectName
  const targetDir = resolve(cwd, projectName || '.')
  const result = validateProjectName(name)

  if (!result.validForNewPackages) {
    errorLog(`Invalid project name: "${name}"`)
    result.errors && result.errors.forEach(err => {
      errorLog(err)
    })
    process.exit(1)
  }

  if (fs.existsSync(targetDir)) {
    if (options.force) {
      await fs.remove(targetDir)
    } else {
      if (isCurrent) {
        const { ok } = await prompt([
          {
            name: 'ok',
            type: 'confirm',
            message: 'Generate project in current directory?'
          }
        ])
        if (!ok) {
          return
        }
      } else {
        const { action } = await prompt([
          {
            name: 'action',
            type: 'list',
            message: `Target directory ${chalk.cyan(targetDir)} already exists. Pick an action:`,
            choices: [
              { name: 'Overwrite', value: 'overwrite' },
              { name: 'Merge', value: 'merge' },
              { name: 'Cancel', value: false }
            ]
          }
        ])
        if (!action) {
          return
        } else if (action === 'overwrite'){
          console.log(`\nRemoving ${chalk.cyan(targetDir)}...`)
          await fs.remove(targetDir)
        }
      }
    }
  }
  const { tpName } = await prompt([
    {
      name: 'tpName',
      type: 'list',
      message: 'Template name:',
      choices: [
        { name: 'Vue', value: 'vue' },
        { name: 'React', value: 'react' }
      ]
    }
  ])

  if (!tplList[tpName]) {
    errorLog('This template doesn\'t exists.')
    return
  }

  const gitPlace = tplList[tpName]['owner/name']
  const gitBranch = tplList[tpName]['branch']

  // 1.提示信息
  hintLog('ym helps you create your project, please wait a moment~')
  logWithSpinner(`✨`, `Creating project in ${chalk.yellow(targetDir)}.`)

  // 2.clone项目从仓库
  await downloadRepo(`${gitPlace}#${gitBranch}`, projectName, { clone: true })
  stopSpinner()
  successLog('New project has been initialized successfully!')

  // 3.执行终端命令npm install
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  await spawn(npm, ['install'], { cwd: isCurrent ?  '.' : `./${project}` })

  // 4.打开浏览器
  open('http://localhost:8080/')

  // 5.运行项目
  await spawn(npm, ['run', 'serve'], { cwd: isCurrent ?  '.' : `./${project}` })
}

const handleEjsToFile = async (name, dest, template, filename) => {
  // 1.获取模块引擎的路径
  const templatePath = resolve(__dirname, template)
  let result = ''
  try {
    result = await ejsCompile(templatePath, { name, lowerName: name.toLowerCase() })
  } catch (error) {
    errorLog(error)
    process.exit(1)
  }
  // 2.写入文件中
  // 判断文件不存在,那么就创建文件
  mkdirSync(dest)
  const targetPath = resolve(dest, filename)
  writeFile(targetPath, result)
}

// 添加组件的action
const addComponent = async (name, dest) => {
  handleEjsToFile(name, dest, '../templates/vue-component.ejs', `${name}.vue`)
}

// 添加组件和路由
const addPage = async (name, dest) => {
  addComponent(name, dest)
  handleEjsToFile(name, dest, '../templates/vue-router.ejs', 'router.js')
}

const addStore = async (name, dest) => {
  handleEjsToFile(name, dest, '../templates/vue-store.ejs', 'index.js')
  handleEjsToFile(name, dest, '../templates/vue-types.ejs', 'types.js')
}

module.exports = {
  createProject,
  addComponent,
  addPage,
  addStore
}