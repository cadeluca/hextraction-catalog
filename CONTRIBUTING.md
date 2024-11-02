# Contributing

## We Develop with GitHub

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Branch Flow

We use the `main` branch as the development branch. All PRs should be made to the `main` branch from a feature branch. To create a pull request, you can use the following steps:

1. Fork the repository and create a new branch from `main`.
2. Ensure that any text content matches the tone of the rest of the site and is clean
3. Follow the "Boy Scout Rule" with code - leave it better than you found it. New code should be well documented. 
4. Test your changes!
5. Provide detail (the what and why) behind your changes and label your pull request with the appropriate labels - for example, a change affecting GitHub actions should have the `actions` label added.
6. Open your pull request, which will be reviewed. Work through any change requests by the maintainer.
7. If approved and merged, congratulations!

Over time, code formatting and linting will be added to the project, and steps & tests will be added accordingly. Similarly, a Pull request template is on the roadmap.

## How To Get Started

### Prerequisites
If just contributing text, you may feel more comfortable editing in the GitHub web view. This is perfectly fine, but I strongly encourage learning and exploring something new with setting up the project on your device. 

- Install [Node.js 20+](https://nodejs.org/en/download/).
- Clone your fork to your device.
- Run `npm install` from the project root directory
- If you don't want to run the data generation scripts locally, skip this step. More notes will be added for this process in the future.    
  - To read the Google Sheet data locally, you'll need to setup a GCP project, enable the Google Sheets API, and generate a service account. 
  - Add the service account credential to your env file.
  - The Google Sheet id environment variable can be populated by grabbing the portion of the Community Catalog URL after "/d/" and the next slash. 

### Data Setup (Optional)

Currently, the database file and produced tile mdx files are saved to the repository to let you skip the steps of generating data, setting up a GCP project, etc. If you are doing data setup or code changes around this, you will want to follow the prereq step. Once setup, run `npm run gen:full` which will execute all three generate data scripts. In order, this will:
1. create a sqlite database in the `/src/data/` directory, with tables for the tiles and importing tiles.
2. fetch and parse the Community Catalog data into your database.
3. produce the `src/pages/tiles/` content for each tile.

### General

More to come in this section. For now, you should be goog to go - fire up the local server with `npm run dev` and have fun!
