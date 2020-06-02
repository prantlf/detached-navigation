node=node -r esm
npmbin=../node_modules/.bin
eslint=$(npmbin)/eslint

test ::
	@echo "> $@"
	@$(node) detach-backbone
	@$(node) detach-window

lint ::
	@echo "> $@"
	@$(eslint) --cache --max-warnings=0  .

fix ::
	@echo "> $@"
	@$(eslint) --fix $(lintjs)
	@$(eslint) --fix $(lintts)

clean ::
	@echo "> $@"
	@rm -rf node_modules .eslintcache

prepare ::
	@echo "> $@"
	@pnpm i --frozen-lockfile --no-verify-store-integrity

upgrade ::
	@echo "> $@"
	@cp package.json package.json.orig
	@ncu -u
	@diff -q package.json package.json.orig && rm package.json.orig \
		|| (rm package.json.orig && pnpm i && make new)
