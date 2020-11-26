/**
 * 执行终端命令相关的代码
 */
const { exec, spawn } = require('child_process')
const { stdout, stderr } = require('process')

const spawnCommand = (...args) => {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(...args)
    // childProcess.stdout.pipe(process.stdout)
    childProcess.stderr.pipe(process.stderr)
    childProcess.on('close', () => {
      resolve()
    })
  })
}

const execCommand = (...args) => {
  return new Promise((resolve, reject) => {
    exec(...args, (err, stdout, stderr) => {
      if (err) {
        reject(err)
        return
      }
      console.log(stdout.replace('\n', ''));
      // console.log(stderr);
      resolve()
    })
  })
}

module.exports = {
  spawn: spawnCommand,
  exec: execCommand
}