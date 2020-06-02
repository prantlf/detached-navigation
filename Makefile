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

lintany=--cache
lintjs=$(lintany) --ext=.js --ignore-pattern=test/typings.js lib test
lintts=$(lintany) --ext=.ts --cache-location .tslintcache -c .tslintrc.yml dist test

prepare ::
	@echo "> $@"
	@pnpm i --frozen-lockfile --no-verify-store-integrity

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
	@node -r esm test/detached-browser
	@node -r esm test/detach-window
	@node -r esm test/detach-backbone
	@node -r esm test/typings

coverage :: all-test
	@echo "> $@"
	@$(nyc) -c -s node -r esm test/detached-browser
	@$(nyc) -c -s --no-clean node -r esm test/detach-window
	@$(nyc) -c -s --no-clean node -r esm test/detach-backbone
	@$(nyc) report
	@$(nyc) check-coverage

clean ::
	@echo "> $@"
	@rm -f dist/*.js dist/*.mjs dist/*.map test/typings.js

new :: clean fix coverage

upgrade ::
	@echo "> $@"
	@cp package.json package.json.orig
	@ncu -u
	@diff -q package.json package.json.orig && rm package.json.orig \
		|| (rm package.json.orig && pnpm i && make new)

dist/index.mjs: lib/index.js lib/detached-browser.js lib/event-emitter.js \
		lib/detach-window.js lib/detach-backbone.js
	@echo "> $@"
	@$(esbuild) $(commonopts) $(moduleopts) $<

dist/index.min.mjs: lib/index.js lib/detached-browser.js lib/event-emitter.js \
		lib/detach-window.js lib/detach-backbone.js
	@echo "> $@"
	@$(esbuild) $(commonopts) $(moduleopts) --minify $<

dist/index.cjs.js: lib/index.js lib/detached-browser.js lib/event-emitter.js \
		lib/detach-window.js lib/detach-backbone.js
	@echo "> $@"
	@$(esbuild) $(commonopts) $(nodeopts) $<

dist/index.iife.js: lib/index.js lib/detached-browser.js lib/event-emitter.js \
		lib/detach-window.js lib/detach-backbone.js
	@echo "> $@"
	@$(esbuild) $(commonopts) $(browseropts) --name=detachedNavigation $<

dist/index.iife.min.js: lib/index.js lib/detached-browser.js lib/event-emitter.js \
		lib/detach-window.js lib/detach-backbone.js
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
