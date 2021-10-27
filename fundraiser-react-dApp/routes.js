const routes = require('next-routes')()

// Default link for new fundraisers page.
routes.add('fundraisers/new', '/fundraisers/new')

// Add a wildcard URL to handle viewing existing fundraisers
// If the user goes to the first argument, show the second argument.
routes.add('/fundraisers/:address', '/fundraisers/display')

// Routing for viewing requests on a specific fundraiser
routes.add('/fundraisers/:address/requests', '/fundraisers/requests/index')

// Routing for creating a spending request
routes.add('/fundraisers/:address/requests/new', '/fundraisers/requests/new')

module.exports = routes;