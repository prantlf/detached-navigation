node=node -r esm
npmbin=./node_modules/.bin
esbuild=$(npmbin)/esbuild
eslint=$(npmbin)/eslint
tsc=$(npmbin)/tsc
nyc=$(npmbin)/nyc

commonopts=--outfile=$@ --log-level=warning --bundle
sourcemaps=--sourcemap --sourcemap=external
nodeopts=--format=cjs --platform=node
browseropts=--format=iife $(sourcemaps)
moduleopts=--format=esm $(sourcemaps)

lintany=--cache --max-warnings=0
lintjs=$(lintany) --ext=.js --ignore-pattern=test/typings.js lib test
lintts=$(lintany) --ext=.ts --cache-location .tslintcache -c .tslintrc.yml dist test

coverfirst=-c -s
coverother=-c -s --no-clean

all: dist/index.mjs dist/index.min.mjs dist/index.cjs.js \
		dist/index.iife.js dist/index.iife.min.js \
	dist/detached-browser.mjs dist/detached-browser.min.mjs dist/detached-browser.cjs.js \
		dist/detached-browser.iife.js dist/detached-browser.iife.min.js \
	dist/detach-window.mjs dist/detach-window.min.mjs dist/detach-window.cjs.js \
		dist/detach-window.iife.js dist/detach-window.iife.min.js \
	dist/detach-backbone.mjs dist/detach-backbone.min.mjs dist/detach-backbone.cjs.js \
		dist/detach-backbone.iife.js dist/detach-backbone.iife.min.js

lint ::
	@echo "> $@"
	@$(eslint) $(lintjs)
	@$(eslint) $(lintts)

fix ::
	@echo "> $@"
	@$(eslint) --fix $(lintjs)
	@$(eslint) --fix $(lintts)

all-test :: all test/typings.js

test :: all-test
	@echo "> $@"
	@$(node) test/detached-browser
	@$(node) test/detach-window
	@$(node) test/detach-backbone
	@$(node) test/typings

coverage :: all-test
	@echo "> $@"
	@$(nyc) $(coverfirst) $(node) test/detached-browser
	@$(nyc) $(coverother) $(node) test/detach-window
	@$(nyc) $(coverother) $(node) test/detach-backbone
	@$(nyc) report
	@$(nyc) check-coverage

clean ::
	@echo "> $@"
	@rm -f dist/*.js dist/*.mjs dist/*.map test/typings.js

clean-deps ::
	@echo "> $@"
	@rm -rf node_modules .nyc_output coverage .eslintcache .tslintcache

clean-all :: clean clean-deps

new :: clean fix coverage

prepare ::
	@echo "> $@"
	@pnpm i --frozen-lockfile --no-verify-store-integrity

upgrade ::
	@echo "> $@"
	@cp package.json package.json.orig
	@ncu -u
	@diff -q package.json package.json.orig && rm package.json.orig \
		|| (rm package.json.orig && pnpm i && make new)

indexdeps=lib/index.js lib/detached-browser.js lib/event-emitter.js \
	lib/detach-window.js lib/detach-backbone.js

dist/index.mjs: $(indexdeps)
	@echo "> $@"
	@$(esbuild) $(commonopts) $(moduleopts) $<

dist/index.min.mjs: $(indexdeps)
	@echo "> $@"
	@$(esbuild) $(commonopts) $(moduleopts) --minify $<

dist/index.cjs.js: $(indexdeps)
	@echo "> $@"
	@$(esbuild) $(commonopts) $(nodeopts) $<

dist/index.iife.js: $(indexdeps)
	@echo "> $@"
	@$(esbuild) $(commonopts) $(browseropts) --name=detachedNavigation $<

dist/index.iife.min.js: $(indexdeps)
	@echo "> $@"
	@$(esbuild) $(commonopts) $(browseropts) --minify --name=detachedNavigation $<

dist/detached-browser.mjs: lib/detached-browser.js lib/event-emitter.js
	@echo "> $@"
	@$(esbuild) $(commonopts) $(moduleopts) $<

dist/detached-browser.min.mjs: lib/detached-browser.js lib/event-emitter.js
	@echo "> $@"
	@$(esbuild) $(commonopts) $(moduleopts) --minify $<

dist/detached-browser.cjs.js: lib/detached-browser.js lib/event-emitter.js
	@echo "> $@"
	@$(esbuild) $(commonopts) $(nodeopts) $<

dist/detached-browser.iife.js: lib/detached-browser.js lib/event-emitter.js
	@echo "> $@"
	@$(esbuild) $(commonopts) $(browseropts) --name=createDetachedBrowser $<

dist/detached-browser.iife.min.js: lib/detached-browser.js lib/event-emitter.js
	@echo "> $@"
	@$(esbuild) $(commonopts) $(browseropts) --minify --name=createDetachedBrowser $<

dist/detach-window.mjs: lib/detach-window.js
	@echo "> $@"
	@$(esbuild) $(commonopts) $(moduleopts) $<

dist/detach-window.min.mjs: lib/detach-window.js
	@echo "> $@"
	@$(esbuild) $(commonopts) $(moduleopts) --minify $<

dist/detach-window.cjs.js: lib/detach-window.js
	@echo "> $@"
	@$(esbuild) $(commonopts) $(nodeopts) $<

dist/detach-window.iife.js: lib/detach-window.js
	@echo "> $@"
	@$(esbuild) $(commonopts) $(browseropts) --name=detachWindowHistory $<

dist/detach-window.iife.min.js: lib/detach-window.js
	@echo "> $@"
	@$(esbuild) $(commonopts) $(browseropts) --minify --name=detachWindowHistory $<

dist/detach-backbone.mjs: lib/detach-backbone.js
	@echo "> $@"
	@$(esbuild) $(commonopts) $(moduleopts) $<

dist/detach-backbone.min.mjs: lib/detach-backbone.js
	@echo "> $@"
	@$(esbuild) $(commonopts) $(moduleopts) --minify $<

dist/detach-backbone.cjs.js: lib/detach-backbone.js
	@echo "> $@"
	@$(esbuild) $(commonopts) $(nodeopts) $<

dist/detach-backbone.iife.js: lib/detach-backbone.js
	@echo "> $@"
	@$(esbuild) $(commonopts) $(browseropts) --name=detachBackboneHistory $<

dist/detach-backbone.iife.min.js: lib/detach-backbone.js
	@echo "> $@"
	@$(esbuild) $(commonopts) $(browseropts) --minify --name=detachBackboneHistory $<

test/typings.js: test/typings.ts
	@echo "> $@"
	@$(tsc) --target es2015 $<
