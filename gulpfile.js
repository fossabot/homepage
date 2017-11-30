// Required modules
const gulp			= require('gulp');
const nunjucks	= require('gulp-nunjucks');
const stylus		= require('gulp-stylus');
const concat		= require('gulp-concat');
const uglify		= require('gulp-uglify');
const rename		= require('gulp-rename');
const pump			= require('pump');

// Nunjucks task
gulp.task('nunjucks', () => {
	pump([
		gulp.src('views/homepage.njk'),
		nunjucks.compile(require('./config.json')),
		rename('homepage.html'),
		gulp.dest('dist')
	]);
});

// Stylus task
gulp.task('stylus', () => {
	pump([
		gulp.src('stylus/main.styl'),
		stylus({
			compress: true
		}),
		gulp.dest('dist')
	]);
});

// JS Task
gulp.task('scripts', () => {
	pump([
		gulp.src('scripts/*.js'),
		concat('main.js'),
		uglify(),
		gulp.dest('dist')
	]);
});

// Watch task
gulp.task('watch', () => {
	gulp.watch(['views/**/*.njk', 'config.json'], ['nunjucks']);
	gulp.watch('stylus/**/*.styl', ['stylus']);
	gulp.watch('scripts/*.js', ['scripts']);
});

// Default task
gulp.task('default', ['nunjucks', 'stylus', 'scripts', 'watch']);

// All task
gulp.task('all', ['nujucks', 'stylus', 'scripts']);
