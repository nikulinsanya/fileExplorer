'use strict';


angular


    .module('controller', ['angularFileUpload','directives','services'])

/**
 * Controllers
 */

.controller('FilesCtrl', ['$scope', '$location', 'storage', 'parser', function ($scope, $location, storage, parser) {
    $scope.model = {
        hasSelected: false,
        selectedFile: false,
        enableEdit : false,
        selectItem:function(e){
            this.resetSelect();
            this.selectedFile = e;
            e.selected = true;
            $scope.model.enableEdit = parser.getFileExtension(e.filename) == 'html';
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
        },
        show: function(){
            $location.path('/show/'+this.selectedFile.id);
        },
        bookmark:function(){
            this.selectedFile.bookmarked = !this.selectedFile.bookmarked;
            storage.storeData($scope.model.items);
            this.selectedFile.selected = true;
        },
        filterBookmarked: function(a){
            return ($scope.showBookmarks && a.bookmarked) || (!$scope.showBookmarks)
        }
    };
    $scope.orderByField = 'name';
    $scope.reverseSort = false;
    storage.loadData().then(function(data){
        $scope.model.items = data;
    })


}])

.controller('ShowCtrl', ['$scope', '$location', '$routeParams', 'storage', 'FileUploader', 'parser',
        function ($scope , $location ,$routeParams, storage, FileUploader, parser) {
            var uploader = $scope.uploader = new FileUploader({});

            $scope.uploader = uploader;

            $scope.model = {
                loaded: false,
                file: {
                    filename:'',
                    content:''
                },
                edit:function(){
                    storage.setFileById($scope.model.file);
                    $location.path('/edit/'+$routeParams.id);
                },
                cancel:function(){
                    $location.path('/');
                }
            }

            storage.getFileById($routeParams.id).then(function(data){
                $scope.model.file = data;
                $scope.model.loaded = true;
                $scope.model.isText =  parser.getFileExtension($scope.model.file.filename) == 'html';

                if(!$scope.model.file){
                    $location.path('/');
                }
            })
}])

.controller('EditCtrl', ['$scope', '$location', '$routeParams', 'storage', function ($scope , $location ,$routeParams, storage) {
    console.log("EditCtrl Controller",$routeParams);
    $scope.model = {
        file: {
            filename:'',
            content:''
        },
        save:function(){
            $scope.model.file.filename = $scope.model.file.filename_splitted + '.html';
            delete($scope.model.file.filename_splitted);
            storage.setFileById($scope.model.file);
            $location.path('/');
        },
        cancel:function(){
            $location.path('/');
        }
    }

    storage.getFileById($routeParams.id).then(function(data){
        $scope.model.file = data;
        $scope.model.file.filename_splitted = $scope.model.file.filename.replace(/.html$/,'');
        if(!$scope.model.file){
            $location.path('/');
        }
    })
}])

.controller('CreateCtrl', ['$scope', '$location', '$routeParams', '$q', 'storage', 'constants', 'FileUploader',
        function ($scope , $location ,$routeParams, $q, storage, constants, FileUploader) {
            var uploader = $scope.uploader = new FileUploader({});

            $scope.uploader = uploader;

            uploader.filters.push({
                name: 'imageFilter',
                fn: function(item /*{File|FileLikeObject}*/, options) {
                    var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                    return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
                }
            });

            $scope.model = {
                processImage: !!($routeParams.type == constants.fileTypes.image),

                file: {
                    filename:'',
                    content:''
                },
                fileToBase64: function(raw){
                    var defer = $q.defer(),
                        reader = new FileReader(),
                        file;

                    reader.onload = function (event) {

                        file = {
                            content:event.target.result,
                            filename: raw.name,
                            size:raw.size
                        };

                        defer.resolve(file)

                    }

                    reader.readAsDataURL(raw);

                    return defer.promise;
                },
                save:function(){
                    var i = $scope.uploader.queue.length,
                        j,
                        defers = [];
                    if($scope.model.processImage && i){
                        while(i--){
                            defers.push($scope.model.fileToBase64($scope.uploader.queue[i]._file));
                        }
                        $q.all(defers).then(function(files){
                            storage.setFiles(files).then(function(){
                                $location.path('/');
                            });
                        });

                    }else if(!$scope.model.processImage){
                        $scope.model.file.filename = $scope.model.file.filename + '.html';
                        storage.setFileById($scope.model.file);
                        $location.path('/');
                    }

                },
                uploadAll: function(){

                },
                cancel:function(){
                    $location.path('/');
                }
            }
}])

.controller('DeleteCtrl', function (/* $scope, $location, $http */) {
    console.log("DeleteCtrl  Controller");
});