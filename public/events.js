var events = new angular.module('events', []);

function mainController($scope, $http)
{
    var last_week = new Date();
    last_week.setDate(last_week.getDate() - 7);

    $http.get('/api/events?since=' + last_week + '&until=' + (new Date()))
        .success(function(data){
            $scope.events = data;
            console.log("Retrieved" + $scope.events.length + " events");
            /*
            for (var i = 0; i < $scope.events.length; i++) {
                $http.get('/api/comments?event_id=' + $scope.events[i]._id)
                    .success(function(c){
                        if ($scope.events[i])
                            $scope.events[i].comments = c;
                    })
                    .error(function(c){
                        if ($scope.events[i])
                            $scope.events[i].comments = [];
                    });
            }//*/
        })
        .error(function(data){
            $scope.events = [];
            console.log("ERROR RETRIEVING EVENTS DATA");
        });
}
