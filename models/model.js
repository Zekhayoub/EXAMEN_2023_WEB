const fs = require('fs');

// Read the content of pwd.txt synchronously
try {
    const passwordContent = fs.readFileSync('pwd.txt', 'utf8');

    const mysql = require("mysql");

    // Connection à la base de données
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: passwordContent,
        database: 'users'
    });

    connection.connect(function (error) {
        if (error) console.log(error);
    });

    // Fonctions liées aux requêtes à la base de données
    const getAllRooms = (callback) => {
        connection.query("SELECT * FROM rooms;", callback);
    };

    const insertRoom = (roomName, roomLength, roomWidth, callback) => {
        const insertQuery = 'INSERT INTO rooms (name, length, width) VALUES (?, ?, ?)';
        connection.query(insertQuery, [roomName, roomLength, roomWidth], callback);
    };

    const deleteRoom = (roomId, callback) => {
        const deleteQuery = 'DELETE FROM rooms WHERE id = ?';
        connection.query(deleteQuery, [roomId], callback);
    };

    const getAllWords = (callback) => {
        connection.query("SELECT * FROM vocabulaire;", callback);
    };

    const insertWord = (word, translation, callback) => {
        const insertQuery = 'INSERT INTO vocabulaire (mot, traduction) VALUES (?, ?)';
        connection.query(insertQuery, [word, translation], callback);
    };

    const deleteWord = (wordId, callback) => {
        const deleteQuery = 'DELETE FROM vocabulaire WHERE id = ?';
        connection.query(deleteQuery, [wordId], callback);
    };

    module.exports = {
        getAllRooms,
        insertRoom,
        deleteRoom,
        getAllWords,
        insertWord,
        deleteWord
    };
} catch (err) {
    console.error('Error reading pwd.txt:', err);
}

