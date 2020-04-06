
const app = require ('express')(); 
const http = require('http').createServer(app);
const cookieParser = require('cookie-parser');
const session = require('express-session');
const io = require ('socket.io')(http);
//const sessionStore = require('sessionstore');
//const sessionSockets = new SessionSockets(io, sessionStore, cookieParser);
//session({secret: "TresSecretDefence"});


app
.use(cookieParser())
.use(session({secret:'TresSecretDefense', saveUninitialized: false, resave:false}))
.get('/chat', function(req, res){
    console.log(req.session)
    res.setHeader('Content-Type','text/html' );
    res.status(200)
    .render('chat.ejs'); 
})
.use (function(req, res){
    res.setHeader('Content-Type', 'text/html' );
    res.status(404).render('er404.ejs');
});


io.on('connection', function (socket) {
    console.log('a user connected');

    socket.broadcast.emit('chat message', 'a user connected');
    
    socket.on('chat message', function (info) {
        console.log('message by '+ session.pseudo + " : " + info);
        if (info != "" &&  !info.match( /^\s+$/)) 
            socket.broadcast.emit('chat message', [session.pseudo, info]); 
    });
    socket.on('disconnect', function () {
        console.log('user disconnected');
        socket.broadcast.emit('chat message', 'a user disconnected');
    });
    socket.on('identity', function(pseudo){
        console.log(pseudo);
        session.pseudo= pseudo;        
    });

});

http.listen(8080);
