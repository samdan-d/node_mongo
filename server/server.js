const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

let app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    console.log(req.body);
    let todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({
            todos
        })
    }).catch((e) => {
        res.status(400).send(e);
    })
});

// Get /todos/:id
app.get('/todos/:id', (req, res) => {
    let id = req.params.id;

    // Validate Id using isValid
        // 404 - send back empty send
    if(!ObjectID.isValid(id)) {
        res.status(404).send();
    }
    // findById
        // Success
            // if todo - send it back
            // if no todo - send back 404 with empty body
        // Error
            // 400 - and send empty body
    Todo.findById(id)
        .then((todo) => {
            if(!todo) {
                res.status(404).send();
            }
            res.send({todo});
        })
        .catch((e) => res.status(400).send());

});

app.listen(3000, () => {
    console.log('Started on port 3000');
});

module.exports = {app};




















