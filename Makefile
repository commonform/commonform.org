build = application
source = source
VPATH = ${source}/html

jspackage = ${build}/index.js
jssources = $(wildcard ${source}/js/*.js)
jsindex = ${source}/js/index.js

stylepackage = ${build}/styles.css
stylesources = $(wildcard ${source}/css/*.less)

npm_bin = ./node_modules/.bin
browserify = ${npm_bin}/browserify
exorcist = ${npm_bin}/exorcist
cssmin = ${npm_bin}/cssmin
lessc = ${npm_bin}/lessc

index = ${build}/index.html

all: ${jspackage} ${stylepackage} ${index}

${jspackage}: ${jssources}
	mkdir -p ${build}
	NODE_ENV=production ${browserify} -g uglifyify ${jsindex} -d | ${exorcist} ${build}/index.js.map > ${jspackage}

${stylepackage}: ${stylesources}
	mkdir -p ${build}
	cat ${stylesources} | ${lessc} - | cssmin > ${stylepackage}

${build}/%.html: %.html
	mkdir -p ${build}
	cp $< $@

.PHONY: clean watch

clean:
	rm -rf ./${build}

watch:
	mkdir -p ${build}
	watchify --verbose --debug source/js/index.js -o application/index.js
