var events = new angular.module('events', []);

function mainController($scope, $http)
{
    $http.get('http://localhost:3000/api/events')
        .success(function(data){
            $scope.events = data;
            console.log(data);
        })
        .error(function(data){
            $scope.events = [];
            console.log("ERROR RETRIEVING EVENTS DATA");
        });
}
