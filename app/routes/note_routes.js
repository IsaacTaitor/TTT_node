var ObjectID = require('mongodb').ObjectID;
module.exports = function(app, db) {
    
    
    app.post('/new_game', (req, res) => {
        
        db.collection('player1').findOne({}, (err, result) => {
            if (err) {
                res.send({ 'status': 'error', 'message': 'An error has occurred' });
            }
            if (result == null) {
                var access_token = (Math.random().toString(36)+'').slice(2, 14);
                var game_token = (Math.random().toString(36)+'').slice(2, 8);

                var player = { 
                    user_name: req.body.user_name,
                    access_t: access_token
                };
                
                var game = { 
                    turn: "player1",
                    move_duration: new Date().getTime(),
                    game_duration: new Date().getTime(),
                    field: [
                        "???",
                        "???",
                        "???"
                        ],
                    size: req.body.size,
                    game_t: game_token
                };

                db.collection('game').insert(game, (err, result) => {
                    if (err) { 
                        res.send({ 'status': 'error', 'message': 'Could not write game data' }); 
                    } else {
                        db.collection('player1').insert(player, (err, result) => {
                            if (err) { 
                                res.send({ 'status': 'error', 'message': 'Could not write data on the player' }); 
                            } else {
                                res.send({ 'status': 'ok', 'access_token': access_token, 'game_token': game_token });
                            }
                        });
                    }
                });
            } else {
                res.send({ 'status': 'error', 'message': 'The game has already begun' });
            }
        });
    });
    
    app.post('/join_game', (req, res) => {
       
        db.collection('game').findOne({"game_t": req.body.game_token}, (err, result) => {
                
            if (err) {
                res.send({ 'status': 'error', 'message': 'An error has occurred' });
            }
            
            if (result !== null) {
                
                db.collection('player2').findOne({}, (err, result) => {
                    if (err) {
                        res.send({ 'status': 'error', 'message': 'An error has occurred' });
                    }
                    if (result == null) {
                        var access_token = (Math.random().toString(36)+'').slice(2, 14);
                        var player = {
                            user_name: req.body.user_name,
                            access_t: access_token
                        };

                        db.collection('player2').insert(player, (err, result) => {
                            if (err) { 
                                res.send({ 'status': 'error', 'message': 'An error has occurred' }); 
                            } else {
                                res.send({ 'status': 'ok', 'access_token': access_token});
                            };
                        })
                    } else {
                        res.send({ 'status': 'error', 'message': 'The game has already started' });
                    }  
                })
            } else {
                res.send({ 'status': 'error', 'message': 'Game not found' });
            }
        });
    });

    app.post('/make_a_move', (req, res) => {
       
        db.collection('player1').findOne({"access_t": req.get("access_token")}, (err, result) => {
                
            if (err) {
                res.send({ 'status': 'error', 'message': 'An error has occurred' });
            }
            
            if (result !== null) {     
            
                db.collection('game').findOne({}, (err, item) => {       
                                        
                    if (item.winner == null) {
                        
                        if (item.field[req.body.row - 1][req.body.col - 1] == "?") {
                            
                            if (item.turn !== "player2") {
                            
                                var field = item.field;
                                var field_r = field[req.body.row - 1];

                                switch(req.body.col - 1) {
                                    case 0: field_r = 'X' + field_r[1] + field_r[2];
                                        break;
                                    case 1: field_r = field_r[0] + 'X' + field_r[2];
                                        break;
                                    case 2: field_r = field_r[0] + field_r[1] + 'X';
                                        break
                                 }

                                field[req.body.row - 1] = field_r;

                                var about_game;

                                if ((field[0] == "XXX") || (field[1] == "XXX") || (field[2] == "XXX") || ((field[0][0] == "X") && (field[1][1] == "X") && (field[2][2] == "X")) || ((field[0][2] == "X") && (field[1][1] == "X") && (field[2][0] == "X")) || ((field[0][0] == "X") && (field[1][0] == "X") && (field[2][0] == "X")) || ((field[0][1] == "X") && (field[1][1] == "X") && (field[2][1] == "X")) || ((field[0][2] == "X") && (field[1][2] == "X") && (field[2][2] == "X"))) {
                                    about_game = {
                                        "turn": "player2",
                                        "move_duration": new Date().getTime(),
                                        "game_duration": item.game_duration,
                                        "field": field,
                                        "size": item.size,
                                        "game_t": item.game_token,
                                        "winner": result.user_name
                                    }
                                    setTimeout(function() {
                                        db.collection('game').remove({});
                                        db.collection('player1').remove({});
                                        db.collection('player2').remove({});
                                    }, 15000);
                                } else {
                                    about_game = {
                                        "turn": "player2",
                                        "move_duration": new Date().getTime(),
                                        "game_duration": item.game_duration,
                                        "field": field,
                                        "size": item.size,
                                        "game_t": item.game_token
                                    }
                                }

                                db.collection('game').update({size: 3}, about_game, (err, result) => {
                                    if (err) {
                                        res.send({'status': 'error', 'message':'An error has occurred'});
                                    } else {
                                        res.send({ 
                                            'status': 'ok',
                                        });
                                    } 
                                });
                            } else {
                                res.send({ 'status': 'error', 'message': 'Now is not your move' });
                            }                            
                        } else {
                            res.send({'status': 'error', 'message':'This place is not available'});
                        }
                    } else {
                        res.send({'status': 'error', 'message':'Game over'});
                    }             
                });
               
            } else {
                db.collection('player2').findOne({"access_t": req.get("access_token")}, (err, result) => {   
                    
                    if (err) {
                        res.send({ 'status': 'error', 'message': 'An error has occurred' });
                    }
                    
                    if (result !== null) {
                        db.collection('game').findOne({}, (err, item) => {       
                                            
                            if (item.winner == null) {
                                  
                                if (item.field[req.body.row - 1][req.body.col - 1] == "?") { 
                            
                                    if (item.turn !== "player1") {
                                
                                        var field = item.field;
                                        var field_r = field[req.body.row - 1];
                                          
                                        switch(req.body.col - 1) {
                                            case 0: field_r = '0' + field_r[1] + field_r[2];
                                                break;
                                            case 1: field_r = field_r[0] + '0' + field_r[2];
                                                break;
                                            case 2: field_r = field_r[0] + field_r[1] + '0';
                                                break
                                        }

                                        field[req.body.row - 1] = field_r;
                                          
                                        var about_game;

                                        if ((field[0] == "000") || (field[1] == "000") || (field[2] == "000") || ((field[0][0] == "0") && (field[1][1] == "0") && (field[2][2] == "0")) || ((field[0][2] == "0") && (field[1][1] == "0") && (field[2][0] == "0")) || ((field[0][0] == "0") && (field[1][0] == "0") && (field[2][0] == "0")) || ((field[0][1] == "0") && (field[1][1] == "0") && (field[2][1] == "0")) || ((field[0][2] == "0") && (field[1][2] == "0") && (field[2][2] == "0"))) {
                                            about_game = {
                                                "turn": "player1",
                                                "move_duration": new Date().getTime(),
                                                "game_duration": item.game_duration,
                                                "field": field,
                                                "size": item.size,
                                                "game_t": item.game_token,
                                                "winner": result.user_name
                                            }
                                            setTimeout(function() {
                                                db.collection('game').remove({});
                                                db.collection('player1').remove({});
                                                db.collection('player2').remove({});
                                            }, 15000);
                                        } else {
                                            about_game = {
                                                "turn": "player1",
                                                "move_duration": new Date().getTime(),
                                                "game_duration": item.game_duration,
                                                "field": field,
                                                "size": item.size,
                                                "game_t": item.game_token
                                            }
                                        }

                                        db.collection('game').update({size: 3}, about_game, (err, result) => {
                                            if (err) {
                                                res.send({'status': 'error', 'message':'An error has occurred'});
                                            } else {
                                                res.send({ 
                                                    'status': 'ok',
                                                });
                                            } 
                                        });
                                    } else {
                                        res.send({ 'status': 'error', 'message': 'Now is not your move' });
                                    }                            
                                } else {
                                    res.send({'status': 'error', 'message':'This place is not available'});
                                }
                            } else {
                                res.send({'status': 'error', 'message':'Game over'});
                            }
                        });
                    } else {
                        res.send({ 'status': 'error', 'result': "this access_token broken" });
                    }
                });
            }
        });             
    });
    
    app.get('/state', (req, res) => {
        
        db.collection('player1').findOne({"access_t": req.get("access_token")}, (err, result) => {
                
            if (err) {
                res.send({ 'status': 'error', 'message': 'An error has occurred' });
            }
            
            if (result !== null) {     
                db.collection('game').findOne({}, (err, item) => {
                                             
                    if (item.turn == "player1") {
                        var turn = true;
                        var ifLeave = 1;
                    } else {
                        var turn = false;
                        var ifLeave = 2;
                    }
                    
                    var move_duration = new Date().getTime() - item.move_duration;
                    if (move_duration > 300000) {
                        res.send({ 'status': 'error', 'message': 'Player ' + ifLeave + ' did not go more than 5 minutes'});
                        setTimeout(function() {
                            db.collection('game').remove({});
                            db.collection('player1').remove({});
                            db.collection('player2').remove({});
                        }, 15000); 
                    } else {
                        
                        if ((item.field[0][0] != '?') && (item.field[0][1] != '?') && (item.field[0][2] != '?') && (item.field[1][0] != '?') && (item.field[1][1] != '?') && (item.field[1][2] != '?') && (item.field[2][0] != '?') && (item.field[2][1] != '?') && (item.field[2][2] != '?') && (item.winner == null)) {
                            res.send({ 
                                'status': 'ok',
                                'you_turn': turn,
                                'game_duration': new Date().getTime() - item.game_duration, 
                                'field' : item.field,
                                'winner': 'draw'    
                            });
                            
                            setTimeout(function() {
                                db.collection('game').remove({});
                                db.collection('player1').remove({});
                                db.collection('player2').remove({});
                            }, 15000);
                        } else {
                            res.send({ 
                                'status': 'ok',
                                'you_turn': turn,
                                'game_duration': new Date().getTime() - item.game_duration, 
                                'field' : item.field,
                                'winner': item.winner    
                            });
                        }                      
                    }   
                });
            } else {
                db.collection('player2').findOne({"access_t": req.get("access_token")}, (err, result) => {   
                    
                    if (err) {
                        res.send({ 'status': 'error', 'message': 'An error has occurred' });
                    }
                    
                    if (result !== null) {
                        db.collection('game').findOne({}, (err, item) => {
                            
                            if (item.turn == "player2") {
                                var turn = true;
                                var ifLeave = 2;
                            } else {
                                var turn = false;
                                var ifLeave = 1;
                            }
                            
                            var move_duration = new Date().getTime() - item.move_duration;
                            if (move_duration > 300000) {
                                res.send({ 'status': 'error', 'message': 'Player ' + ifLeave + ' did not go more than 5 minutes'});
                                setTimeout(function() {
                                    db.collection('game').remove({});
                                    db.collection('player1').remove({});
                                    db.collection('player2').remove({});
                                }, 15000);        
                            } else {
                                if ((item.field[0][0] != '?') && (item.field[0][1] != '?') && (item.field[0][2] != '?') && (item.field[1][0] != '?') && (item.field[1][1] != '?') && (item.field[1][2] != '?') && (item.field[2][0] != '?') && (item.field[2][1] != '?') && (item.field[2][2] != '?') && (item.winner == null)) {
                                    res.send({ 
                                        'status': 'ok',
                                        'you_turn': turn,
                                        'game_duration': new Date().getTime() - item.game_duration, 
                                        'field' : item.field,
                                        'winner': 'draw'
                                    });
                                   
                                    setTimeout(function() {
                                        db.collection('game').remove({});
                                        db.collection('player1').remove({});
                                        db.collection('player2').remove({});
                                    }, 15000);
                                } else {
                                    res.send({ 
                                        'status': 'ok',
                                        'you_turn': turn,
                                        'game_duration': new Date().getTime() - item.game_duration, 
                                        'field' : item.field,
                                        'winner': item.winner    
                                    });
                                }        
                            }         
                        });  
                    } else {
                        res.send({ 'status': 'error', 'result': "this access_token broken" });
                    }
                });
            }
        });
    }); 
}