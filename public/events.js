var events = new angular.module('events', []);

function mainController($scope, $http)
{
    var next_week = new Date();
    next_week.setDate(next_week.getDate() + 7);

    $http.get('/api/events?since=' + (new Date()) + '&until=' + next_week)
        .success(function(data){
            $scope.events = data;
            console.log(data);
        })
        .error(function(data){
            $scope.events = [];
            console.log("ERROR RETRIEVING EVENTS DATA");
        });
}
