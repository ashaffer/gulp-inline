var through = require('through2')
  , cheerio = require('cheerio')
  , gulp = require('gulp')
  , _ = require('lodash')
  , url = require('url')
  , gutil = require('gulp-util')
  , path = require('path');

function isLocal(href) {
  return href && href.slice(0, 2) !== '//' && ! url.parse(href).hostname;
}

var styleTmpl = '<style>\n<%= contents %>\n</style>'
  , scriptTmpl = '<script type="text/javascript">\n<%= contents %>\n</script>';

function replace(el, tmpl) {
  return through.obj(function(file, enc, cb) {
    el.replaceWith(_.template(tmpl, {contents: String(file.contents)}));
    this.push(file);
    cb();
  });
}

function injectStyles($, process, base, cb) {
  var styles = [];
  $('link').each(function(idx, el) {
    el = $(el);
    if(el.attr('rel') === 'stylesheet' && isLocal(el.attr('href'))) {
      styles.push(el);
    }
  });

  if(styles.length) {
    var done = _.after(styles.length, cb);
    _.each(styles, function(el) {
      gulp.src(path.join(base, el.attr('href')))
        .pipe(process)
        .pipe(replace(el, styleTmpl))
        .pipe(through.obj(function(file, enc, cb) {
          cb();
        }, done));
    });
  } else
    cb();
}

function injectScripts($, process, base, cb) {
  var scripts = [];
  $('script').each(function(idx, el) {
    el = $(el);
    if(el.attr('type') === 'text/javascript' && isLocal(el.attr('src'))) {
      scripts.push(el);
    }
  });

  if(scripts.length) {
    var done = _.after(scripts.length, cb);
    _.each(scripts, function(el) {
      gulp.src(path.join(base, el.attr('src')))
        .pipe(process)
        .pipe(replace(el, scriptTmpl))
        .pipe(through.obj(function(file, enc, cb) {
          cb();
        }, done));
    });
  } else
    cb();
}

module.exports = function(opts) {
  return through.obj(function(file, enc, cb) {
    var $ = cheerio.load(String(file.contents))
      , self = this
      , done = _.after(2, function() {
        file.contents = new Buffer($.html());
        self.push(file);
        cb();
      });

    opts = opts || {};
    opts.base = opts.base || '';
    opts.css = opts.css || gutil.noop();
    opts.js = opts.js || gutil.noop();

    injectStyles($, opts.css, opts.base, done);
    injectScripts($, opts.js, opts.base, done);
  });
};