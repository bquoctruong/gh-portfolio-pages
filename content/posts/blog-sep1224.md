--- 
title: "GitHub Actions Deploy"
date: 2024-09-12
---

### Introduction
Today, I'd like to delve into the primary CICD pipeline I use to deploy to multiple environments: GitHub Actions.
As an independent developer, this will be one of the most common platforms to utilize when working on multiple projects due to
its high visibility, versatility, and acceptance.

My background was primarily Gitlab CICD-focused; while there are similarities between GitHub Actions and Gitlab CICD,
the differences are enough to where one simply cannot drag-and-drop a pre-existing YAML file and
pray that it works. While you can always manually deploy from your V.S. Code terminal and check on the deployment at the
destination, this paradigm will
inevitably fail. One of the core tenants of CICD is the ability to always deploy tested code to a production environment without
fear of failure.

### TL;DR - GCP
```yaml
name: Build, Deploy to GCP Cloud Run / Lambda

on:

	workflow_run:
	workflows: [CodeQL]
	types:
		- completed
jobs:
	build:
		if: github.event.workflow_run.conclusion == 'success'
		runs-on: ubuntu-latest
		steps:
		- name: Checkout code
			uses: actions/checkout@v4

		- name: Build Docker image
			run: |
			docker build -t ${{ vars.SERVICE }}:${{ github.sha }} ./

		- name: Save Docker image to tar file
			run: |
			docker save ${{ vars.SERVICE }}:${{ github.sha }} -o ${{ vars.SERVICE }}_${{ github.sha }}.tar

		- name: Upload image artifact
			uses: actions/upload-artifact@v4
			with:
			name: ${{ vars.SERVICE }}_${{ github.sha }}
			path: ${{ vars.SERVICE }}_${{ github.sha }}.tar
			retention-days: 1
	deploy-gcp:
	# Add 'id-token' with the intended permissions for workload identity federation
	needs: 
	[build]
	permissions:
	contents: 'read'
	id-token: 'write'
	runs-on: ubuntu-latest
	steps:
	- name: Download image artifact
		uses: actions/download-artifact@v4
		with:
		name: ${{ vars.SERVICE }}_${{ github.sha }}
		path: /tmp

	- name: Google Auth
		id: auth
		uses: 'google-github-actions/auth@v2'
		with:
		credentials_json: ${{ secrets.GCP_SA_KEY }}
	- id: 'access-secret'
		run: |-
		curl https://secretmanager.googleapis.com/v1/projects/my-project/secrets/my-secret/versions/1:access \
			--header "Authorization: Bearer ${{ steps.auth.outputs.access_token }}"

	# BEGIN - Docker auth and build (NOTE: If you already have a container image, these Docker steps can be omitted)

	- name: Set up Cloud SDK
		uses: google-github-actions/setup-gcloud@v1
		with:
		version: 'latest'
	- name: Authenticate Docker with GCR
		run: |
		gcloud auth configure-docker ${{ vars.GAR_LOCATION }}-docker.pkg.dev --quiet
		gcloud auth print-access-token | docker login -u oauth2accesstoken --password-stdin https://gcr.io

	- name: Load, Build and Push Container
		run: |-
		docker load -i /tmp/${{ vars.SERVICE }}_${{ github.sha }}.tar
		docker image tag ${{ vars.SERVICE }}:${{ github.sha }} ${{ vars.GAR_LOCATION }}-docker.pkg.dev/${{ vars.PROJECT_ID }}/${{ vars.SERVICE }}-0/${{ vars.SERVICE }}:${{ github.sha }}
		docker push ${{ vars.GAR_LOCATION }}-docker.pkg.dev/${{ vars.PROJECT_ID }}/${{ vars.SERVICE }}-0/${{ vars.SERVICE }}:${{ github.sha }}

	# END - Docker auth and build

	- name: Deploy to Cloud Run
		id: deploy
		uses: google-github-actions/deploy-cloudrun@v2
		with:
		service: ${{ vars.SERVICE }}
		region: ${{ vars.REGION }}
		image: ${{ vars.GAR_LOCATION }}-docker.pkg.dev/${{ vars.PROJECT_ID }}/${{ vars.SERVICE }}-0/${{ vars.SERVICE }}:${{ github.sha }}

	# If required, use the Cloud Run url output in later steps
	- name: Show Output
		run: echo ${{ steps.deploy.outputs.url }}
```

### Why
In my search for hosting a portfolio website as thrifty as possible, I settled on deploying to
Google Cloud Platform (GCP), specifically utilizing Google's Cloud Run.
Cloud Run has a generous free-tier that allows one to host serverless applications, which is
perfect for a static website. Although you can host a static website for free via
GitHub Pages, I decided to add the additional challenge of the following: custom domain
(Presentation matters) and the beginning of a multi-cloud deployment strategy.