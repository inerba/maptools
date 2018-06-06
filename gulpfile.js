var critical = require('critical');
var babelify = require('babelify');
var browserSync = require('browser-sync');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var gulp = require('gulp');
var plugins = require('gulp-load-plugins');
var source = require('vinyl-source-stream');


/* ----------------- */
/* Development
/* ----------------- */

gulp.task('development', ['scripts', 'styles'], () => {
    browserSync({
        'server': './',
        'snippetOptions': {
            'rule': {
                'match': /<\/body>/i,
                'fn': (snippet) => snippet
            }
        }
    });

    gulp.watch('./src/scss/**/*.scss', ['styles']);
    gulp.watch('./src/scripts/**/*.js', ['scripts']);
    gulp.watch('./*.html', browserSync.reload);
});


/* ----------------- */
/* Scripts
/* ----------------- */

gulp.task('scripts', () => {
    return browserify({
        'entries': ['./src/scripts/main.js'],
        'debug': true,
        'transform': [
            babelify.configure({
                'presets': ['env']
            })
        ]
    })
    .bundle()
    .on('error', function () {
        var args = Array.prototype.slice.call(arguments);

        plugins().notify.onError({
            'title': 'Compile Error',
            'message': '<%= error.message %>'
        }).apply(this, args);

        this.emit('end');
    })
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(plugins().sourcemaps.init({'loadMaps': true}))
    .pipe(plugins().sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/js/'))
    .pipe(browserSync.stream());
});


/* ----------------- */
/* Styles
/* ----------------- */

gulp.task('styles', () => {
    return gulp.src('./src/scss/**/*.scss')
        .pipe(plugins().sourcemaps.init())
        .pipe(plugins().sass().on('error', plugins().sass.logError))
        .pipe(plugins().sourcemaps.write())
        .pipe(gulp.dest('./dist/css/'))
        .pipe(browserSync.stream());
});


/* ----------------- */
/* HTML
/* ----------------- */

gulp.task('html', ['cssmin'], () => {
    return gulp.src('index.html')
        .pipe(critical.stream({
            'base': 'dist/',
            'inline': true,
            'extract': true,
            'minify': true,
            'css': ['./dist/css/style.css']
        }))
        .pipe(gulp.dest('build'));
});


/* ----------------- */
/* Cssmin
/* ----------------- */

gulp.task('cssmin', () => {
    return gulp.src('./src/scss/**/*.scss')
        .pipe(plugins().sass({
            'outputStyle': 'compressed'
        }).on('error', plugins().sass.logError))
        .pipe(gulp.dest('./dist/css/'));
});


/* ----------------- */
/* Jsmin
/* ----------------- */

gulp.task('jsmin', () => {
    var envs = plugins().env.set({
        'NODE_ENV': 'production'
    });

    return browserify({
        'entries': ['./src/scripts/main.js'],
        'debug': false,
        'transform': [
            babelify.configure({
                'presets': ['es2015', 'react']
            })
        ]
    })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(envs)
    .pipe(buffer())
    .pipe(plugins().uglify())
    .pipe(envs.reset)
    .pipe(gulp.dest('./dist/js/'));
});

/* ----------------- */
/* Taks
/* ----------------- */

gulp.task('copy', function () {
    gulp.src([
        "node_modules/leaflet/dist/leaflet.css",
    ])
    .pipe(gulp.dest('assets/vendor/leaflet/'));
    
    gulp.src([
        "node_modules/leaflet/dist/images/*",
    ])
    .pipe(gulp.dest('assets/vendor/leaflet/images/'));
    
    gulp.src([
        "node_modules/leaflet-draw/dist/leaflet.draw.css",
    ])
    .pipe(gulp.dest('assets/vendor/leaflet-draw/'));

    gulp.src([
        "node_modules/leaflet-draw/dist/images/*",
    ])
    .pipe(gulp.dest('assets/vendor/leaflet-draw/images/'));
});

gulp.task('default', ['development']);
gulp.task('deploy', ['html', 'jsmin']);