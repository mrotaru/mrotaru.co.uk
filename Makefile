PATH=

deploy:
	/c/Python27/Scripts/aws s3 sync . s3://mrotaru.co.uk/ --recursive --exclude ".git/*" --profile "mrotaru.co.uk-s3"

.PHONY: deploy
