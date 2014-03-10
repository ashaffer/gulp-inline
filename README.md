gulp-inline
===========
[![Build Status](https://drone.io/github.com/ashaffer/gulp-inline/status.png)](https://drone.io/github.com/ashaffer/gulp-inline/latest)
[![Coverage Status](https://coveralls.io/repos/ashaffer/gulp-inline/badge.png)](https://coveralls.io/r/ashaffer/gulp-inline)

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
