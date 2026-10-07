.PHONY: setup dev test clean

setup:
	npm install

dev:
	npm run build
	@echo "Starting api and ui..."
	npm run start --workspace=api

test:
	node test.js

clean:
	npm run clean

