'use strict';


angular


    .module('services', [])

.factory('storage', ['$rootScope','$http', '$q', 'parser', 'constants',
        function ($rootScope, $http, $q, parser, constants) {
    var service = {

        setItem: function (key,value) {
            try {
                localStorage[key] = value;
            } catch (e) {
                alert('Localstorage quota exceeded! Can\'t save more files!');
            }
        },

        getItem: function (key) {
            return localStorage[key];
        },

        storeData: function(files){
            files = this.prepareFilesBeforeSave(files);
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
        setFiles: function(newFiles){
            var j,
                self = this,
                file,
                found = false,
                i,
                newArray = [],
                maxId= 0,
                defer = $q.defer();

            self.loadData().then(function(files){
                if(files){
                    j = newFiles.length;
                    while(j--){
                        file = newFiles[j];
                        i = files.length;
                        found = false;
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
                            maxId += 1;
                            file.id = maxId;
                            files.push(file);
                            self.storeData(files);
                        }
                    }
                    defer.resolve();
                }
            });
            return defer.promise;

        },
        setFileById: function(file){
            var defer = $q.defer(),
                self = this,
                found = false,
                i, maxId=0;
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
            var i = files.length,
                j;
            while(i--){
                files[i].size = angular.toJson(files[i]).length;
                files[i].type = parser.getFileExtension(files[i].filename);

                for(j in constants.fileExtensions){
                    if(constants.fileExtensions[j].indexOf(files[i].type) != -1){
                        files[i].type = j;
                        break;
                    }
                }
            }
            return files;
        },
        prepareFilesBeforeSave: function(files){
            var i = files.length;
            while(i--){
                files[i].selected = false;
                files[i].selected = false;
            }
            return files;
        },
        saveTmpImg: function(base64){
            this.setItem('fb-image',base64);
        },
        getTmpImg: function(){
            return this.getItem('fb-image');
        },
        resetTmpImg: function(){
            this.setItem('fb-image','');
        }
    }



    return service;
}])

.factory('parser', [function () {
    return{
        getFileExtension: function(filename){
            var splitted = filename.split('.'),
                i = splitted.length;
            return splitted[i-1];
        }
    }
}])

.factory('constants', ['$rootScope','$http', '$q', function ($rootScope, $http, $q) {
    return{
        fileTypes:{
            "image":'img',
            "text":'txt'
        },
        fileExtensions:{
            text: ["html"],
            image: ['jpg','jpeg','gif','png','ico','tif']
        }
    }
}])

.config( [
    '$compileProvider',
    function( $compileProvider )
    {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);
    }
]);

