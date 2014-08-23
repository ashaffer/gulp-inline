var chai = require('chai')
  , expect = chai.expect
  , gulp = require('gulp')
  , through = require('through2')
  , fs = require('fs')
  , path = require('path')
  , inline = require('../');

describe('gulp-inline', function() {
  function inputOutput(name, done) {
    var base = 'test/fixtures';
    gulp.src(path.join(base, name + '.html'))
      .pipe(inline({base: base}))
      .on('data', function(file) {
        expect(String(file.contents)).to.equal(fs.readFileSync(path.join(base, name + '-output.html'), 'utf8'));
        done();
      });
  }

  it('should inline a stylesheet', function(done) {
    inputOutput('css', done);
  });

  it('should inline a script', function(done) {
    inputOutput('js', done);
  });

  it('should inline SVG', function(done) {
    inputOutput('svg', done);
  });

  it('should inline a basic template', function(done) {
    inputOutput('basic', done);
  });
});
