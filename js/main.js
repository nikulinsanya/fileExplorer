
var app = angular.module('alexApp', [
    'ngRoute',
    'textAngular'
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
    .when("/delete/:id", {templateUrl: "partials/delete.html", controller: "DeleteCtrl"})

    // else 404
    .otherwise("/404", {templateUrl: "partials/404.html", controller: "FilesCtrl"});
}]);



/**
 * Controllers
 */

app.controller('FilesCtrl', ['$scope', '$location', 'storage',function ($scope, $location, storage) {
    $scope.model = {
        hasSelected: false,
        selectedFile: false,
        selectItem:function(e){
            this.resetSelect();
            this.selectedFile = e;
            e.selected = true;
            $scope.model.hasSelected = e.selected;
        },
        resetSelect: function(){
            var i = $scope.model.items.length;
            while(i--){
                $scope.model.items[i].selected = false;
            }
            $scope.model.hasSelected = false;
        },
        edit: function(){
            $location.path('/edit/'+this.selectedFile.id);
        }
    };
    $scope.orderByField = 'name';
    $scope.reverseSort = false;
    storage.loadData().then(function(data){
        $scope.model.items = data;
    })


}]);


app.controller('EditCtrl', ['$scope', '$location', '$routeParams', 'storage', function ($scope , $location ,$routeParams, storage) {
    console.log("EditCtrl Controller",$routeParams);
    $scope.model = {
        isNew : !$routeParams.id,
        file: {
            title:'',
            content:''
        },
        save:function(){
            storage.setFileById($scope.model.file);
            $location.path('/');
        },
        cancel:function(){
            $location.path('/');
        }
    }

    if(!$scope.model.isNew){
        storage.getFileById($routeParams.id).then(function(data){
            $scope.model.file = data;
            if(!$scope.model.file){
                $location.path('/');
            }
        })
    }
    else{
        $scope.model.title = '';
        $scope.model.content = '';
    }

}]);


app.controller('DeleteCtrl', function (/* $scope, $location, $http */) {
    console.log("DeleteCtrl  Controller");
});

/**
 *Services
 **/

app.factory('storage', ['$rootScope','$http', '$q', function ($rootScope, $http, $q) {
    var service = {

        setItem: function (key,value) {
            localStorage[key] = value;
        },

        getItem: function (key) {
            return localStorage[key];
        },

        storeData: function(files){
            this.setItem('files',angular.toJson(files));
        },

        loadData: function () {
            var defer = $q.defer(),
                self = this;
            if(!this.getItem('files')){
                $http.get('data/data.json').
                    success(function(data, status, headers, config) {
                        self.storeData(data);
                        defer.resolve(self.prepareFilesAfterLoad(data));
                    }).
                    error(function(data, status, headers, config) {
                        defer.reject();
                    });
            }
            else{
                defer.resolve(self.prepareFilesAfterLoad(angular.fromJson(self.getItem('files'))));
            }
            return defer.promise;
        },

        getFileById: function(id){
            var defer = $q.defer(),
                self = this,
                i;
            self.loadData().then(function(files){
               if(files){
                   i = files.length;
                   while(i--){
                       if(files[i].id == id){
                           defer.resolve(files[i]);
                           break;
                       }
                   }
                   defer.resolve();
               }else{
                   defer.reject();
               }
            });
            return defer.promise;
        },
        setFileById: function(file){
            var defer = $q.defer(),
                self = this,
                found = false,
                i, maxId;
            self.loadData().then(function(files){
                if(files){
                    i = files.length;
                    while(i--){
                        maxId = maxId < files[i].id ? files[i].id : maxId;
                        if(files[i].id == file.id){
                            found = true;
                            files[i] = file;
                            self.storeData(files);
                            break;
                        }
                    }
                    if(!found){
                        file.id = maxId +1;
                        files.push(file);
                        self.storeData(files);
                    }
                    defer.resolve();
                }else{
                    defer.reject();
                }
            });
            return defer.promise;
        },

        prepareFilesAfterLoad: function(files){
            var i = files.length;
            while(i--){
                files[i].size = angular.toJson(files[i]).length;
                files[i].type = files[i].filename.split('.')[1];
            }
            return files;
        },
        prepareFilesBeforeSave: function(files){
            return files;
        }
    }

    $rootScope.$on("savestate", service.SaveState);
    $rootScope.$on("restorestate", service.RestoreState);

    return service;
}]);