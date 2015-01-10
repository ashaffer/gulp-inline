gulp-inline
===========
[![Build Status](https://drone.io/github.com/ashaffer/gulp-inline/status.png)](https://drone.io/github.com/ashaffer/gulp-inline/latest)
[![Coverage Status](https://drone.io/github.com/ashaffer/gulp-inline/files/badge.png)](https://drone.io/github.com/ashaffer/gulp-inline/files/coverage/lcov-report/index.html)

## Information

<table>
  <tr><td>Package</td><td>gulp-inline</td></tr>
  <tr><td>Description</td><td>Inlines js/css/svg into your html files</td></tr>
  <tr><td>Node Version</td><td>= 0.10</td></tr>
</table>


## Usage

```javascript
var inline = require('gulp-inline')
  , uglify = require('gulp-uglify')
  , minifyCss = require('gulp-minify-css');

gulp.src('public/index.html')
  .pipe(inline({
    base: 'public/',
    js: uglify(),
    css: minifyCss()
  }))
  .pipe(gulp.dest('dist/'));
```

Replaces your &lt;script&gt; and &lt;link&gt; tags with the corresponding inlined files.

## Options

Plugin options:

  * base - the root directory containing the files to be inlined
  * css - css transform (gulp plugin)
  * js - js transform (gulp plugin)
  * svg - svg transform (gulp plugin)

