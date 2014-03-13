gulp-inline
===========
[![Build Status](https://drone.io/github.com/ashaffer/gulp-inline/status.png)](https://drone.io/github.com/ashaffer/gulp-inline/latest)
[![Coverage Status](https://drone.io/github.com/ashaffer/gulp-inline/files/badge.png)](https://drone.io/github.com/ashaffer/gulp-inline/files/coverage/lcov-report/index.html)

Inline styles and scripts into an html file.

## Example

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
