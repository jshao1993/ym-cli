const program = require('commander')

const { 
  createProject,
  addComponent,
  addPage,
  addStore
} = require('./actions')

const { successLog, errorLog, hintLog } = require('../utils/log');

const { stopSpinner } = require('../utils/spinner')

// .option('-d --dest <dest>', 'a destination folder')

function camelize (str) {
  return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}

function cleanArgs (cmd) {
  const args = {}
  cmd.options.forEach(o => {
    const key = camelize(o.long.replace(/^--/, ''))
    // if an option is not present and Command has a method with the same name
    // it should not be copied
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key]
    }
  })
  return args
}

const createCommands = () => {
  // 创建项目指令
  program
    .command('create <project>')
    .description('clone a repository into a newly created directory')
    .option('-f --force', 'overwrite target directory if it exists')
    .option('-g --git [message]', 'force git initialization with initial commit message')
    .action((project, cmd) => {
      const options = cleanArgs(cmd)
      if (process.argv.includes('-g') || process.argv.includes('--git')) {
        options.forceGit = true
      }
      createProject(project, options)
        .catch(err => {
          stopSpinner(false)
          errorLog(err)
          process.exit(1)
        })
    })

  program
    .command('addcpn <name>')
    .description('add vue component, 例如: ym addcpn HelloWorld [-d dest]')
    .action((name) => {
      addComponent(name, program.dest || 'src/components')
    })

  program
    .command('addpage <name>')
    .description('add vue page, 例如: ym addpage Home [-d dest]')
    .action((name) => {
      addPage(name, program.dest || `src/pages/${name.toLowerCase()}`)
    })

  program
    .command('addstore <name>')
    .description('add vue store, 例如: ym addstore favor [-d dest]')
    .action((store) => {
      addStore(store, program.dest || `src/store/modules/${name.toLowerCase()}`)
    })
}

module.exports = createCommands