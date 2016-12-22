/**
 * Imports
 */

var assert = require('assert')
var gulp = require('gulp')
var fs = require('fs')
var path = require('path')
var inline = require('..')
var Transform = require('readable-stream/transform')
var base = 'test/fixtures'

/**
 * Tests
 */

describe('gulp-inline', function () {
  it('should inline a stylesheet', function (done) {
    inputOutput('css', done)
  })

  it('should inline a script', function (done) {
    inputOutput('js', done)
  })

  it('should preserve attributes', function (done) {
    inputOutput('attrs', done)
  })

  it('should inline SVG', function (done) {
    inputOutput('svg', done)
  })

  it('should inline an image', function (done) {
    inputOutput('img', done)
  })

  it('should inline a basic template', function (done) {
    inputOutput('basic', done)
  })

  it('should work with inline event listeners', function (done) {
    inputOutput('inline-events', done)
  })

  it('should not automatically create unnecessary html entities', function (done) {
    inputOutput('apostrophe', done)
  })

  it('should not duplicate css', function (done) {
    inputOutput('duplicate-css', done)
  })

  it('should inline using relative paths when src not absolute', function (done) {
    inputOutputArgs('relative', undefined, done);
  })

  it('should ignore files if option is set', function (done) {
    gulp.src(path.join(base, 'ignore.html'))
      .pipe(inline({
        ignore: ['/ignore.js', '/ignore.css', '/ignore.svg'],
        base: base
      }))
      .on('data', function (file) {
        assert.equal(String(file.contents), fs.readFileSync(path.join(base, 'ignore-output.html'), 'utf8'))
        done()
      })
  })

  it('should ignore tag types if option is set', function (done) {
    gulp.src(path.join(base, 'disable.html'))
      .pipe(inline({
        disabledTypes: ['svg', 'img', 'js', 'css'],
        base: base
      }))
      .on('data', function (file) {
        assert.equal(String(file.contents), fs.readFileSync(path.join(base, 'disable-output.html'), 'utf8'))
        done()
      })
  })

  it('should run Transform stream with no parameters on files', function(done) {
    gulp.src(path.join(base, 'basic-transform.html'))
      .pipe(inline({
        css: dummyTransform,
        base: base
      }))
      .on('data', function (file) {
        assert.equal(String(file.contents), fs.readFileSync(path.join(base, 'basic-transform-output.html'), 'utf8'))
        done()
      })
  })

  it('should run Transform stream with parameters on files', function(done) {
    gulp.src(path.join(base, 'basic-transform.html'))
      .pipe(inline({
        css: dummyTransform({}),
        base: base
      }))
      .on('data', function (file) {
        assert.equal(String(file.contents), fs.readFileSync(path.join(base, 'basic-transform-output.html'), 'utf8'))
        done()
      })
  })

  it('should run multiple Transform streams on files', function(done) {
    gulp.src(path.join(base, 'basic-transform.html'))
      .pipe(inline({
        css: [dummyTransform, dummyTransform({})],
        base: base
      }))
      .on('data', function (file) {
        assert.equal(String(file.contents), fs.readFileSync(path.join(base, 'basic-transform-output.html'), 'utf8'))
        done()
      })
  })


  it('should inline SVG referenced in <use> tag', function (done) {
    inputOutput('svg-use', done)
  })

  describe('acceptance-tests', function(){
    it('should not change case of HTML attributes', function (done) {
      inputOutput('html-tag-with-upper-attr', done)
    })
  })

})

function dummyTransform() {
  return new transform({
    objectMode: true,
    transform: function(file, enc, cb) {
      file.contents = new Buffer("Transformed file")
      this.push(file)
      cb()
    }
  })
}

function inputOutput (name, done) {
  var args = {base: base}
  inputOutputArgs(name, args, done);
}

function inputOutputArgs (name, inlineArgs, done) {
  gulp.src(path.join(base, name + '.html'))
    .pipe(inline(inlineArgs))
    .on('data', function (file) {
      assert.equal(String(file.contents), fs.readFileSync(path.join(base, name + '-output.html'), 'utf8'))
      done()
    })
}
