build:
	rm -rf build/
	mkdir build
	jade src/index.jade --out build
	jade src/projects.jade --out build

deploy:
	aws s3 sync . s3://mrotaru.co.uk/ --recursive --exclude ".git/*" --profile "mrotaru.co.uk-s3"

.PHONY: build
