build:
	jade src/index.jade --out .
	jade src/projects.jade --out .

deploy:
	aws s3 sync . s3://mrotaru.co.uk/ --recursive --exclude ".git/*" --profile "mrotaru.co.uk-s3"

.PHONY: build
