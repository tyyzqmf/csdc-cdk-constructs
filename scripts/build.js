const fs = require('fs')
const {rm} = require('fs/promises')
const path = require('path')

const packagePath = 'source/patterns/@csdc-solutions-constructs'
const allTargets = (fs.readdirSync(packagePath).filter(f => {
    if (!fs.statSync(`${packagePath}/${f}`).isDirectory()) {
      return false
    }
    const pkg = require(`../${packagePath}/${f}/package.json`)
    return !(pkg.private && !pkg.buildOptions);
}))

const args = require('minimist')(process.argv.slice(2))
const targets = args._.length ? args._ : allTargets
const formats = args.formats || args.f
const maxConcurrency = 4

const build = async function (target) { 
  const pkgDir = path.resolve(`${packagePath}/${target}`)
  const pkg = require(`${pkgDir}/package.json`)

  await rm(`${pkgDir}/dist`,{ recursive: true, force: true })
  
  const { execa } = await import('execa');
  await execa(
      'rollup',
      [
        '-c',
        '--environment',
        [
          `TARGET:${target}`,
          formats ? `FORMATS:${formats}` : ``
        ]
          .filter(Boolean)
          .join(',')
      ],
      { stdio: 'inherit' }
  )
}

const buildAll = async function () {
  const ret = []
  const executing = []
  for (const item of targets) {
    const p = Promise.resolve().then(() => build(item))
    ret.push(p)

    if (maxConcurrency <= targets.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1))
      executing.push(e)
      if (executing.length >= maxConcurrency) {
        await Promise.race(executing)
      }
    }
  }
  return Promise.all(ret)
}
buildAll()