// Require all plugins
var gulp = require('gulp'),
	del = require('del'),
	less = require('gulp-less'),
	cache = require('gulp-cache'),
	cssmin = require('gulp-minify-css'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	jshint = require('gulp-jshint'),
	connect = require('gulp-connect'),
	imagemin = require('gulp-imagemin'),
	sourcemaps = require('gulp-sourcemaps');


// Compile less into css, create sourcemaps and minify.
gulp.task('style', function () {
	gulp.src(['src/less/style.less'])
		.pipe(less({}))
		.on('error', function (e) { console.log('Error:' + e.message); })
		.pipe(gulp.dest('dist/assets/css'))
		.pipe(rename({suffix: '.min'}))
		.pipe(cssmin({keepSpecialComments: 0	}))
		.pipe(gulp.dest('dist/assets/css'))
		.pipe(connect.reload());
});


// Run jshint on script files, concat and create sourcemaps. Uglify.
gulp.task('javascript', function () {
	gulp.src(['src/js/**/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(concat('tock.js'))
		.on('error', function (e) { console.log('Error:' + e.message); })
		.pipe(gulp.dest('dist/assets/js'))
		.pipe(rename({suffix: '.min'}))
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.on('error', function (e) { console.log('Error:' + e.message); })
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist/assets/js'));
});


// Minify new or updated images.
gulp.task('images', function () {
	gulp.src('src/images/*')
		.pipe(cache(imagemin({
			optimizationLevel: 5,
			progressive: true,
			interlaced: true
		})))
		.on('error', function (e) { console.log('Error:' + e.message); })
		.pipe(gulp.dest('dist/assets/images'));
});


// Copy font files
gulp.task('fonts', function () {
	gulp.src('bower_components/fontawesome/fonts/*')
		.on('error', function (e) { console.log('Error:' + e.message); })
		.pipe(gulp.dest('dist/assets/fonts'));
});


// Take care of the html
gulp.task('html', function () {
	gulp.src('src/index.html')
		.pipe(gulp.dest('dist'));
});


// Jshint the gulpfile
gulp.task('test', function () {
	gulp.src('gulpfile.js')
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));
});


// Clean the assets folder
gulp.task('clean', function (callback) {
	// We use a callback to ensure the task finishes before exiting.
	del(['dist'], callback);
});


// Watch for changes
gulp.task('watch', function () {
	gulp.watch('src/less/**/*.less', ['style', 'reload']);
	gulp.watch('src/js/**/*.js', ['javascript', 'reload']);
	gulp.watch('src/images/**/*', ['images', 'reload']);
	gulp.watch('src/**/*.html', ['html', 'reload']);
});


gulp.task('connect', function () {
	return connect.server({
		root: 'dist',
		livereload: true
	});
});

gulp.task('reload', function () {
	connect.reload();
});

// Default task. Run everything.
gulp.task('default', ['clean'], function () {
	gulp.start(
		'style',
		'javascript',
		'images',
		'fonts',
		'html',
		'connect',
		'watch'
	);
});