
var app = angular.module('alexApp', [
    'ngRoute',
    'textAngular',
    'controller',
    'directives',
    'services'
]);

/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
    // Home
    .when("/", {templateUrl: "partials/files.html", controller: "FilesCtrl"})
    // Pages
    .when("/edit/:id", {templateUrl: "partials/edit.html", controller: "EditCtrl"})
    .when("/create/:type", {templateUrl: "partials/create.html", controller: "CreateCtrl"})
    .when("/show/:id", {templateUrl: "partials/show.html", controller: "ShowCtrl"})

    // else 404
    .otherwise("/", {templateUrl: "partials/files.html", controller: "FilesCtrl"});
}]);
