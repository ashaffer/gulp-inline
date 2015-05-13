var through = require('through2');
var cheerio = require('cheerio');
var gulp = require('gulp');
var url = require('url');
var path = require('path');
var fs = require('fs');

var typeMap = {
  css: {
    tag: 'link',
    template: function(contents, el) {
      var attribute = el.attr('media');
      attribute = attribute ? ' media="' + attribute +  '" ' : '';

      return '<style' + attribute + '>\n' + String(contents) + '\n</style>';
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
      return '<script type="text/javascript">\n' + String(contents) + '\n</script>';
    },
    filter: function(el) {
      return isLocal(el.attr('src'));
    },
    getSrc: function(el) {
      return el.attr('src');
    }
  },

  img: {
    tag: 'img',
    template: function(contents, el) {
      el.attr('src', 'data:image/unknown;base64,' + contents.toString('base64'));
      return cheerio.html(el);
    },
    filter: function(el) {
      var src = el.attr('src');
      return !/\.svg$/.test(src);
    },
    getSrc: function(el) {
      return el.attr('src');
    }
  },

  svg: {
    tag: 'img',
    template: function(contents) {
      return String(contents);
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
    el.replaceWith(tmpl(file.contents, el));
    this.push(file);
    cb();
  });
}

function inject($, process, base, cb, opts, relative) {
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
      var src = opts.getSrc(el);
      var file = path.join(src[0] === '/' ? base : relative, src);
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
  opts = opts || {};
  opts.base = opts.base || '';

  return through.obj(function(file, enc, cb) {
    var self = this;
    var $ = cheerio.load(String(file.contents), {decodeEntities: false});
    var typeKeys = Object.getOwnPropertyNames(typeMap);
    var done = after(typeKeys.length, function() {
      file.contents = new Buffer($.html());
      self.push(file);
      cb();
    });

    typeKeys.forEach(function(type) {
      inject($, opts[type], opts.base, done, typeMap[type], path.dirname(file.path));
    });
  });
};
