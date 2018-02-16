var events = new angular.module('events', []);

function mainController($scope, $http)
{
    var last_week = new Date();
    last_week.setDate(last_week.getDate() - 7);

    $http.get('/api/events?since=' + last_week + '&until=' + (new Date()))
        .success(function(data){
            $scope.events = data;
            console.log(data);
        })
        .error(function(data){
            $scope.events = [];
            console.log("ERROR RETRIEVING EVENTS DATA");
        });
}
