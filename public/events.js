var events = new angular.module('events', []);

function mainController($scope, $http)
{
    var last_week = new Date();
    last_week.setDate(last_week.getDate() - 7);

    $http.get('/api/search/events?since=' + last_week + '&until=' + (new Date()))
        .success(function(data){
            var events = data;
            /*
            for (var i = 0; i < events.length; i++) {
                $http.get('/api/comments?event_id=' + events[i]._id)
                    .success(function(c){
                        if (events[i])
                            events[i].comments = c;
                    })
                    .error(function(c){
                        if (events[i])
                            events[i].comments = [];
                    });
            }//*/
            $scope.events = events;
            console.log("Retrieved" + $scope.events.length + " events");
        })
        .error(function(data){
            $scope.events = [];
            console.log("ERROR RETRIEVING EVENTS DATA");
        });
}
