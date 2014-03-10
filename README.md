gulp-inline
===========
[![Build Status](https://drone.io/github.com/ashaffer/gulp-inline/status.png)](https://drone.io/github.com/ashaffer/gulp-inline/latest)

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
