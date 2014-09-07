var through = require('through2')
  , cheerio = require('cheerio')
  , gulp = require('gulp')
  , _ = require('lodash')
  , url = require('url')
  , gutil = require('gulp-util')
  , path = require('path');

var typeMap = {
  css: {
    tag: 'link',
    template: '<style>\n<%= contents %>\n</style>',
    test: function(el) {
      return el.attr('rel') === 'stylesheet' && isLocal(el.attr('href'));
    },
    getSrc: function(el) {
      return el.attr('href');
    }
  },

  js: {
    tag: 'script',
    template: '<script type="text/javascript">\n<%= contents %>\n</script>',
    test: function(el) {
      return el.attr('type') === 'text/javascript' && isLocal(el.attr('src'));
    },
    getSrc: function(el) {
      return el.attr('src');
    }
  },

  svg: {
    tag: 'img',
    template: '<%= contents %>',
    test: function(el) {
      var src = el.attr('src');
      return /\.svg$/.test(src) && isLocal(src);
    },
    getSrc: function(el) {
      return el.attr('src');
    }
  }
};

function isLocal(href) {
  return href && href.slice(0, 2) !== '//' && ! url.parse(href).hostname;
}

function replace(el, tmpl) {
  return through.obj(function(file, enc, cb) {
    el.replaceWith(_.template(tmpl, {contents: String(file.contents)}));
    this.push(file);
    cb();
  });
}

function inject($, process, base, cb, opts) {
  var items = [];

  $(opts.tag).each(function(idx, el) {
    el = $(el);
    if(opts.test(el)) {
      items.push(el);
    }
  });

  if(items.length) {
    var done = _.after(items.length, cb);
    _.each(items, function(el) {
      gulp.src(path.join(base, opts.getSrc(el)))
        .pipe(process)
        .pipe(replace(el, opts.template))
        .pipe(through.obj(function(file, enc, cb) {
          cb();
        }, done));
    });
  } else {
    cb();
  }
}

module.exports = function(opts) {
  return through.obj(function(file, enc, cb) {
    var $ = cheerio.load(String(file.contents))
      , self = this
      , typeKeys = Object.getOwnPropertyNames(typeMap)
      , done = _.after(typeKeys.length, function() {
        file.contents = new Buffer($.html());
        self.push(file);
        cb();
      });

    opts = opts || {};
    opts.base = opts.base || '';

    typeKeys.forEach(function(type) {
      inject($, opts[type] || gutil.noop(), opts.base, done, typeMap[type]);
    });

  });
};
