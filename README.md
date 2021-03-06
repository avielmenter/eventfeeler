# EventFeeler
Project for UCI's CS 125 Class.

# About
EventFeeler is an application that helps users locate events on the UCI Campus. Users can search events by time, location, and category, and leave comments on those events. EventFeeler also recommends events to users based on the user's history of event attendance.

# Setup
## Prerequisites
To run this project, you must already have downloaded and installed:
- [Node.js](https://nodejs.org/en/)
- [MongoDB](https://www.mongodb.com/)

## Installation
To install this web application, perform the following steps:
1. Clone this repository via the command `git clone https://github.com/avielmenter/eventfeeler.git`
2. Navigate to the `eventfeeler` folder.
3. Run the command `npm install`.

## Environment Variables
To run this application, you must first configure certain environment variables on your system:
- `EVENTFEELER_PORT`: The port on which the application will run.
- `EVENTFEELER_DB_SERVER`: The URI of the application's MongoDB server.
- `EVENTFEELER_DB_SCHEMA`: The specific database schema used by the application.
- `EVENTFEELER_DB_USER`: Username for MongoDB access.
- `EVENTFEELER_DB_PASSWORD`: Password for MongoDB access.
- `EVENTFEELER_FB_APP_ID`: An application ID for the Facebook Graph API.
- `EVENTFEELER_FB_APP_SECRET`: An application secret for the Facebook Graph API.
- `EVENTFEELER_TWITTER_KEY`: An application key for the Twitter API.
- `EVENFEELER_TWITTER_SECRET`: An application secret for the Twitter API.
- `EVENTFEELER_SESSION_SECRET`: The secret used to encrypt session variables.
- `EVENTFEELER_HOSTNAME`: The domain name for your application, e.g. "localhost".

You can set these environment variables using your operating system, or you can configure them in a `.env` file placed in the root of the `eventfeeler` directory.

A `template.env` file is included with the project. You can rename this file to `.env`, configure the variables contained within the file, and add the database user and password variables as necessary to set up your project.

# Run
EventFeeler requires access to a running database. If you are connecting the application to a database on your local system, before you start EventFeeler, be sure to start MongoDB using the command `mongod`.

To run EventFeeler, navigate to the `eventfeeler` folder, and start the application using the command `npm start`.

# APIs
See the [API documentation](https://github.com/avielmenter/eventfeeler/tree/master/api) for information on how to use the EventFeeler APIs.

# Collaborators
Mohammad Bouzari

Chloe Bui

Aviel Menter

Cindy Tran

# License
This repository is licensed under the [GNU General Public License v3.0](https://github.com/avielmenter/eventfeeler/blob/master/LICENSE).
