const gulp = require('gulp')
const uglify = require('gulp-uglify')
const minifyCss = require('gulp-clean-css')
const concat = require('gulp-concat')
const rollup = require('rollup')
const swGenerator = require('sw-precache')
const targetDir = 'app'
const rootDir = 'dist'
const concatJsName = 'index.min.js'
const concatCssName = 'index.min.css'
const path = require('path')
const fs = require('fs')
const swName = 'sw.js'
const resolve = (p = '') => path.join(__dirname, './' + targetDir, p)

gulp.task('script', () => {
  rollup.rollup({
    input: './' + targetDir + '/js/index.js'
  }).then(bundle => {
    bundle.write({
      file: `./${rootDir}/${concatJsName}`,
      format: 'iife'
    })
  }).catch(e => console.log(e))
  // return bundle
  //   .pipe(uglify())
  //   .pipe(concat(concatJsName))
  //   .pipe(gulp.dest(rootDir))
})

gulp.task('css', () => {
  return gulp.src(targetDir + '/css/*.css')
    .pipe(minifyCss())
    .pipe(concat(concatCssName))
    .pipe(gulp.dest(rootDir))
})

gulp.task('generateSw', () => {
  swGenerator.write(`${rootDir}/${swName}`, {
    staticFileGlobs: [rootDir + '/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff}'],
    stripPrefix: rootDir
  })
})

gulp.task('watch', () => {
  gulp.watch(targetDir + '/js/*.js', () => {gulp.tasks.script.fn()})
  gulp.watch(targetDir + '/css/*.css', () => {gulp.tasks.css.fn()})
  gulp.watch(targetDir, () => {gulp.tasks.generateSw.fn()})
  console.log('resource change')
})

gulp.task('dev', () => {
  gulp.tasks.watch.fn()
  gulp.tasks.css.fn()
  gulp.tasks.script.fn()
  gulp.tasks.generateSw.fn()
})

function generatorHtml (cb) {
  fs.readFile(resolve('/index.html'), (err, fd) => {
    if (err) {
      console.log('read html err')
    } else {
      let html = fd.toString()
      html = html.replace('<\/head>', `<link rel="stylesheet" href="./${concatCssName}"\/><\/head>`)
      html = html.replace('<\/body>', `<script src="./${concatJsName}"><\/script><\/body>`)
      fs.writeFile(path.resolve(__dirname, rootDir + '/index.html'), html, err => {
        if (err) {
          console.log('write file fail')
        } else {
          console.log('write file successful')
          typeof cb === 'function' && cb()
        }
      })
    }
  })
}

function watchHtml () {
  if (!fs.existsSync(path.resolve(__dirname, './' + rootDir))) {
    fs.mkdirSync(path.resolve(__dirname, './' + rootDir))
  }
  generatorHtml()
  let state = 0 // 0 not task 1 task 2 need exec
  fs.watch(resolve(), (event, fname) => {
    if (fname === 'index.html') {
      if (state === 0) {
        state = 1
        setTimeout(generatorHtml, 0, () => {
          if (state === 2) {
            generatorHtml(() => {state = 0})
          } else {
            state = 0
          }
        })
      } else {
        state = 2
      }
    }
  })
}


module.exports = function () {
  watchHtml()
  gulp.tasks.dev.fn()
}
