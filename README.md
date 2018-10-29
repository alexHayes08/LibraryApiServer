# README

# Description
    This project is a general purpose 'library' like (the book kind)
    application to allow for checking in/out various resources as well as the
    creation/deletion of said resources. These 'resources' are stored in the
    form of JSON.

# Deployment

Update endpoints:
gcloud endpoints services deploy .\openapi.json

Update app engine:
gcloud app deploy
