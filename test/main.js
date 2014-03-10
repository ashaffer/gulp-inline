var chai = require('chai')
  , expect = chai.expect
  , gulp = require('gulp')
  , through = require('through2')
  , fs = require('fs')
  , inline = require('../');

describe('gulp-inline', function() {
  it('should inline a basic template', function(done) {
    gulp.src('test/fixtures/basic.html')
      .pipe(inline({base: 'test/fixtures'}))
      .on('data', function(file) {
        expect(String(file.contents)).to.equal(fs.readFileSync('test/fixtures/basic-output.html', 'utf8'));
        done();
      });
  });
});