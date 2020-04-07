const express = require ('express');
const app = express(); 
const http = require('http').createServer(app);
const cookieParser = require('cookie-parser');
const sharedsession = require('express-socket.io-session'); // la SEULE VRAI SOLUTION QUI MARCHE ACTUELLEMENT POUR LES SESSIONS SOUS SOCKET.IO
const session =  require("express-session")({
    secret: "TresSecretDefense",
    resave: true,
    saveUninitialized: true
  });
const io = require ('socket.io')(http);

app
    .use(cookieParser())
    .use(session)
    .get('/chat', function(req, res){    
        res.setHeader('Content-Type','text/html' );
        res.status(200).render('chat.ejs'); 
    })
    .use (function(req, res){
        res.setHeader('Content-Type', 'text/html' );
        res.status(404).render('er404.ejs');
    });

io.
    use(sharedsession(session, { // pour utiliser les sessions sous express-socket.io-session
        autoSave:true
    }))
    .on('connection', function (socket) { 
        socket.on('chat message', function (info) {
            if (info != "" &&  !info.match( /^\s+$/)) 
                socket.broadcast.emit('chat message', [socket.handshake.session.pseudo, info]); // on recup ensuite les variables de sessions dans socket.handshake.session
        });
        socket.on('disconnect', function () {
            socket.broadcast.emit('chat message',['', socket.handshake.session.pseudo + ' s\'est déconnecté']);
        });
        socket.on('identity', function(pseudo){
            socket.handshake.session.pseudo=pseudo;   
            socket.handshake.session.save(); 
            socket.broadcast.emit('chat message', ['', socket.handshake.session.pseudo + ' s\'est connecté']);   
        });

    });

http.listen(8080);
