build:
	rm -rf build/
	mkdir build
	jade index.jade --out build
	jade projects.jade --out build
	cp -r static build

deploy:
	aws s3 sync ./build s3://mrotaru.co.uk/ --profile "mrotaru.co.uk-s3" 

.PHONY: build
