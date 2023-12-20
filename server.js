const express = require('express');
const app = express();
app.use(express.static("public"));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const model = require('./models/model.js');

const getRoomData = (response) => {
    model.getAllRooms((error, resultSQL) => {
        if (error) {
            response.status(400).send(error);
        } else {
            let dataBase = {};
            response.status(200);
            dataBase.roomTable = resultSQL;

            console.log(dataBase);
            response.render('home.ejs', dataBase);
        }
    });
};

const addRoom = (roomName, roomLength, roomWidth, response) => {
    model.insertRoom(roomName, roomLength, roomWidth, (insertErr, result) => {
        if (insertErr) {
            console.error('Error adding room:', insertErr);
            return;
        }
        console.log(`Room "${roomName}" added successfully with ID ${result.insertId}`);
        getRoomData(response);
    });
};

const deleteRoomById = (roomId, response) => {
    model.deleteRoom(roomId, (deleteErr, result) => {
        if (deleteErr) {
            console.error('Error deleting room:', deleteErr);
            return;
        }
        console.log(`Room with ID ${roomId} deleted successfully: ${JSON.stringify(result)}`);
        getRoomData(response);
    });
};

const getWordData = (response) => {
    model.getAllWords((error, resultSQL) => {
        if (error) {
            response.status(400).send(error);
        } else {
            let dataBase = {};
            response.status(200);

            // Calculer le pourcentage de réponses correctes pour chaque mot mais je n'ai pas eu le temps de terminer et de bien l'implémenter            
            dataBase.wordTable = resultSQL.map(word => {
                const totalAttempts = word.correct_attempts + word.incorrect_attempts;
                const percentageCorrect = totalAttempts > 0 ? (word.correct_attempts / totalAttempts) * 100 : 0;

                return {
                    id: word.id,
                    mot: word.mot,
                    traduction: word.traduction,
                    percentageCorrect: Math.round(percentageCorrect * 100) / 100, // Arrondir à deux décimales
                };
            });

            console.log(dataBase);
            response.render('home.ejs', dataBase);
        }
    });
};

const addWord = (word, translation, response) => {
    model.insertWord(word, translation, (insertErr, result) => {
        if (insertErr) {
            console.error('Error adding word:', insertErr);
            return;
        }
        console.log(`Word "${word}" added successfully with ID ${result.insertId}`);
        getWordData(response);
    });
};

const deleteWordById = (wordId, response) => {
    model.deleteWord(wordId, (deleteErr, result) => {
        if (deleteErr) {
            console.error('Error deleting word:', deleteErr);
            return;
        }
        console.log(`Word with ID ${wordId} deleted successfully: ${JSON.stringify(result)}`);
        getWordData(response);
    });
};

app.post('/addRoom', (request, response) => {
    const { roomName, roomLength, roomWidth } = request.body;
    if (roomName && roomLength && roomWidth) {
        addRoom(roomName, roomLength, roomWidth, response);
    }
});

app.post('/deleteRoom', (request, response) => {
    const { deleteRoom } = request.body;
    if (deleteRoom) {
        deleteRoomById(deleteRoom, response);
    }
});

app.post('/addWord', (request, response) => {
    const { word, translation } = request.body;
    if (word && translation) {
        addWord(word, translation, response);
    }
});

app.post('/deleteWord', (request, response) => {
    const { deleteWord } = request.body;
    if (deleteWord) {
        deleteWordById(deleteWord, response);
    }
});

app.post('/testMemory', (request, response) => {
    const { selectedWord, userTranslation } = request.body;

    model.getAllWords((error, resultSQL) => {
        if (error) {
            response.status(400).send(error);
        } else {
            const selectedWordObj = resultSQL.find(word => word.id == selectedWord);

            if (selectedWordObj) {
                const correctTranslation = selectedWordObj.traduction;
                const isCorrect = userTranslation.toLowerCase() === correctTranslation.toLowerCase();

                let feedback;
                if (isCorrect) {
                    feedback = 'Réponse correcte!';
                } else {
                    feedback = 'Réponse incorrecte. La traduction correcte est : ' + correctTranslation;
                }

                let dataBase = {
                    wordTable: resultSQL,
                    feedback: feedback
                };

                response.status(200);
                response.render('home.ejs', dataBase);
            } else {
                response.status(404).send('Mot non trouvé.');
            }
        }
    });
});

app.get('/', (request, response) => {
    getWordData(response);
});

app.listen(80, function () {
    console.log("Server ok, 80");
});
