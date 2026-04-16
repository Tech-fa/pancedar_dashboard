# Makefile for deploying Vue app to S3 and CloudFront

AWS_PROFILE ?= 4es
export AWS_PROFILE

S3_BUCKET ?= s3://4es-dashboard
CLOUDFRONT_DISTRIBUTION_ID ?= E1DNDATAGU2AF0
VITE_API_URL ?= https://staging-api.smartclick.solutions


build:
	VITE_API_URL="$(VITE_API_URL)" npm run build

sync_s3:
	aws s3 sync dist/ "$(S3_BUCKET)"

invalidate_cloudfront:
	aws cloudfront create-invalidation --distribution-id "$(CLOUDFRONT_DISTRIBUTION_ID)" --paths "/*"

deploy: build sync_s3 invalidate_cloudfront
.PHONY: deploy 