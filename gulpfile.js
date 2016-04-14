// Require all plugins
var gulp = require('gulp'),
	del = require('del'),
	plugins = require('gulp-load-plugins')();


// Compile less into css, create sourcemaps and minify.
gulp.task('style', ['clean'], function () {
	return gulp.src(['src/less/style.less'])
		.pipe(plugins.plumber())
		.pipe(plugins.less())
		.pipe(gulp.dest('dist/assets/css'))
		.pipe(plugins.rename({suffix: '.min'}))
		.pipe(plugins.cleanCss({keepSpecialComments: false}))
		.pipe(gulp.dest('dist/assets/css'))
		.pipe(plugins.connect.reload());
});


// Run jshint on script files, concat and create sourcemaps. Uglify.
gulp.task('javascript', ['clean'], function () {
	return gulp.src(['src/js/**/*.js'])
		.pipe(plugins.plumber())
		.pipe(plugins.jshint())
		.pipe(plugins.jshint.reporter('jshint-stylish'))
		.pipe(plugins.concat('tock.js'))
		.pipe(gulp.dest('dist/assets/js'))
		.pipe(plugins.rename({suffix: '.min'}))
		.pipe(plugins.sourcemaps.init())
		.pipe(plugins.uglify())
		.pipe(plugins.sourcemaps.write('.'))
		.pipe(gulp.dest('dist/assets/js'));
});


// Minify new or updated images.
gulp.task('images', ['clean'], function () {
	return gulp.src('src/images/*')
		.pipe(plugins.plumber())
		.pipe(plugins.cache(plugins.imagemin({
			optimizationLevel: 5,
			progressive: true,
			interlaced: true
		})))
		.pipe(gulp.dest('dist/assets/images'));
});


// Copy font files
gulp.task('fonts', ['clean'], function () {
	gulp.src('bower_components/fontawesome/fonts/*')
		.pipe(plugins.plumber())
		.pipe(gulp.dest('dist/assets/fonts'));
});


// Take care of the html
gulp.task('html', ['clean'], function () {
	return gulp.src('src/*.html')
		.pipe(plugins.plumber())
		.pipe(gulp.dest('dist'));
});


// Jshint the gulpfile
gulp.task('test', function () {
	return gulp.src('gulpfile.js')
		.pipe(plugins.plumber())
		.pipe(plugins.jshint())
		.pipe(plugins.jshint.reporter('jshint-stylish'));
});


// Clean the assets folder
gulp.task('clean', function () {
	del(['dist']);
});


// Watch for changes
gulp.task('watch', function () {
	gulp.watch('src/less/*.less', ['style', 'reload']);
	gulp.watch('src/js/*.js', ['javascript', 'reload']);
	gulp.watch('src/images/**/*', ['images', 'reload']);
	gulp.watch('src/*.html', ['html', 'reload']);
});


gulp.task('connect', function () {
	return plugins.connect.server({
		root: 'dist',
		livereload: true
	});
});

gulp.task('reload', function () {
	plugins.connect.reload();
});

// Default task. Run everything.
gulp.task('default', [
	'style',
	'javascript',
	'images',
	'fonts',
	'html',
	'connect',
	'watch'
	]
);
