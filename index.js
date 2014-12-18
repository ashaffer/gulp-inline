var through = require('through2');
var cheerio = require('cheerio');
var gulp = require('gulp');
var url = require('url');
var path = require('path');
var fs = require('fs');

var typeMap = {
  css: {
    tag: 'link',
    template: function(contents) {
      return '<style>\n' + contents + '\n</style>'
    },
    filter: function(el) {
      return el.attr('rel') === 'stylesheet' && isLocal(el.attr('href'));
    },
    getSrc: function(el) {
      return el.attr('href');
    }
  },

  js: {
    tag: 'script',
    template: function(contents) {
      return '<script type="text/javascript">\n' + contents + '\n</script>';
    },
    filter: function(el) {
      return el.attr('type') === 'text/javascript' && isLocal(el.attr('src'));
    },
    getSrc: function(el) {
      return el.attr('src');
    }
  },

  svg: {
    tag: 'img',
    template: function(contents) {
      return contents;
    },
    filter: function(el) {
      var src = el.attr('src');
      return /\.svg$/.test(src) && isLocal(src);
    },
    getSrc: function(el) {
      return el.attr('src');
    }
  }
};

function noop() {
  return through.obj(function(file, enc, cb) {
    this.push(file);
    cb();
  });
}

function after(n, cb) {
  var i = 0;
  return function() {
    i++;
    if(i === n) cb.apply(this, arguments);
  };
}

function isLocal(href) {
  return href && href.slice(0, 2) !== '//' && ! url.parse(href).hostname;
}

function replace(el, tmpl) {
  return through.obj(function(file, enc, cb) {
    el.replaceWith(tmpl(String(file.contents)));
    this.push(file);
    cb();
  });
}

function inject($, process, base, cb, opts) {
  var items = [];

  $(opts.tag).each(function(idx, el) {
    el = $(el);
    if(opts.filter(el)) {
      items.push(el);
    }
  });

  if(items.length) {
    var done = after(items.length, cb);
    items.forEach(function(el) {
      var file = path.join(base, opts.getSrc(el));
      if (fs.existsSync(file)) {
        gulp.src(file)
          .pipe(process || noop())
          .pipe(replace(el, opts.template))
          .pipe(through.obj(function(file, enc, cb) {
            cb();
          }, done));
      } else {
        done();
      }
    });
  } else {
    cb();
  }
}

module.exports = function(opts) {
  return through.obj(function(file, enc, cb) {
    var self = this;
    var $ = cheerio.load(String(file.contents));
    var typeKeys = Object.getOwnPropertyNames(typeMap);
    var done = after(typeKeys.length, function() {
      file.contents = new Buffer($.html());
      self.push(file);
      cb();
    });

    opts = opts || {};
    opts.base = opts.base || '';

    typeKeys.forEach(function(type) {
      inject($, opts[type], opts.base, done, typeMap[type]);
    });
  });
};
