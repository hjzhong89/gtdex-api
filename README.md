GTDEx API
===

API Server for GTD Explorer

Pre-requisites
===

1. [Download and extract gtd.json.zip](https://gtd-public.s3.amazonaws.com/gtd.json.zip)
1. Move the JSON file to gtdex-api/resources/gtd.json
1. [Get NPM](https://www.npmjs.com/get-npm)
1. Install the project

    ```
   cd gtdex
   npm install
    ```

## Running the Application
1. Follow all pre-requisites.
1. Serve the application
    ```
    npm run serve
    ```
1. [Open in your browser to test](http://localhost:3000/api/country)



Open Terminal.
Change the current working directory to your local repository.
To remove the file, enter git rm --cached:
$ git rm --cached giant_file
# Stage our giant file for removal, but leave it on disk
Commit this change using --amend -CHEAD:
$ git commit --amend -CHEAD
# Amend the previous commit with your change
# Simply making a new commit won't work, as you need
# to remove the file from the unpushed history as well
Push your commits to GitHub:
$ git push
# Push our rewritten, smaller commit
