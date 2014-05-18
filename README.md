# Custom Homepage API for NodeBB

Allows you to re-define the homepage API call for NodeBB. This plugin is meant to be used in combination with a theme that can take advantage of this modified route.

## TODO

Right now, this just returns a list of categories with the latest X topics of each category (as opposed the default behaviour, which is X posts). In the future perhaps I can add some toggles in the ACP to choose exactly what to add/remove from the call, or perhaps redirect the route altogether (ex. returning `/recent` instead)

## Installation

    npm install nodebb-plugin-homepage-api
