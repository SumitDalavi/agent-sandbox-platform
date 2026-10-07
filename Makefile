.PHONY: setup dev test clean

setup:
	npm install

dev:
	npm run build
	@echo "Starting api and ui..."
	npm run start --workspace=api

test:
	npm run test

clean:
	npm run clean
