var noteRoutes = require('./note_routes');
module.exports = function(app, db) {
    noteRoutes(app, db);
    var clearDB = setInterval(function() {
    
        db.collection('game').findOne({size: 3}, (err, item) => {
                        
            if (item != null) {
                var move_duration = new Date().getTime() - item.move_duration;
                if (move_duration > 420000) {
                    db.collection('game').remove({});
                    db.collection('player1').remove({});
                    db.collection('player2').remove({});
                }
            }      
        }); 
    }, 1000);
};