import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import path from 'path'
import json from '@rollup/plugin-json'
import terser from '@rollup/plugin-terser'
import ts from 'rollup-plugin-typescript2'

const require = createRequire(import.meta.url)
const __dirname = fileURLToPath(new URL('.', import.meta.url))
const packagesDir = path.resolve(__dirname, 'source/patterns/@csdc-solutions-constructs')
const packageDir = path.resolve(packagesDir, process.env.TARGET)

const resolve = p => path.resolve(packageDir, p)
const pkg = require(resolve(`package.json`))
const packageOptions = pkg.buildOptions || {}
const name = packageOptions.filename || path.basename(packageDir)

// Define compilation items corresponding to output types
const outputConfigs = {
'esm-bundler': {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: `es`
  },
  'esm-browser': {
    file: resolve(`dist/${name}.esm-browser.js`),
    format: `es`
  },
  cjs: {
    file: resolve(`dist/${name}.cjs.js`),
    format: `cjs`
  },
  global: {
    name: name,
    file: resolve(`dist/${name}.global.js`),
    format: `iife`
  }
}

const defaultFormats = ['esm-bundler', 'cjs']
const inlineFormats = process.env.FORMATS && process.env.FORMATS.split(',')
const packageFormats = inlineFormats || packageOptions.formats || defaultFormats
const packageConfigs = packageFormats.map(format => createConfig(format, outputConfigs[format]))

export default packageConfigs

function createConfig(format, output, plugins = []) {
  // Output declaration file
  const shouldEmitDeclarations = !!pkg.types

  const tsPlugin = ts({
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    tsconfigOverride: {
      compilerOptions: {
        target: format === 'cjs' ? 'es2020' : 'es2015',
        sourceMap: true,
        declaration: shouldEmitDeclarations,
        declarationMap: shouldEmitDeclarations
      }
    }
  })
  
  const minifyPlugin = format === 'global' && format === 'esm-browser' ? [terser()] : []
  return {
    input: resolve('lib/index.ts'),
    // Global and Browser ESM builds inlines everything so that they can be
    // used alone.
    external: [
        ...['path', 'fs', 'os', 'http'],
        ...Object.keys(pkg.dependencies||{}),
        ...Object.keys(pkg.peerDependencies || {}),
        ...Object.keys(pkg.devDependencies||{}),
        ],
    plugins: [
        json({
        namedExports: false
        }),
        tsPlugin,
        ...minifyPlugin,
        ...plugins
    ],
    output,
    onwarn: (msg, warn) => {
        if (!/Circular/.test(msg)) {
        warn(msg)
        }
    },
    treeshake: {
        moduleSideEffects: false
    }
  }
}