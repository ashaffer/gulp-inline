var chai = require('chai');
var expect = chai.expect;
var gulp = require('gulp');
var through = require('through2');
var fs = require('fs');
var path = require('path');
var inline = require('..');
var base = 'test/fixtures';

describe('gulp-inline', function() {
  function inputOutput(name, done) {
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

  it('should inline an image', function(done) {
    inputOutput('img', done);
  });

  it('should inline a basic template', function(done) {
    inputOutput('basic', done);
  });

  it('should work with inline event listeners', function(done) {
    inputOutput('inline-events', done);
  });

  it('should not automatically create unnecessary html entities', function(done) {
    inputOutput('apostrophe', done);
  });

  it('should not duplicate css', function(done) {
    inputOutput('duplicate-css', done);
  });

  it('should inline using relative paths when src not absolute', function(done) {
    gulp.src(path.join(base, 'relative.html'))
      .pipe(inline())
      .on('data', function(file) {
        expect(String(file.contents)).to.equal(fs.readFileSync(path.join(base, 'basic-output.html'), 'utf8'));
        done();
      });
  });
});
