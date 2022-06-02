var inline = require("gulp-inline");
var gulp = require("gulp");

gulp.task("default", function() {
  return gulp
    .src("dist/index.html")
    .pipe(
      inline({
        base: "dist/"
      })
    )
    .pipe(gulp.dest("inlined/"));
});
 