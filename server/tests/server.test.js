const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
    _id: new ObjectID(),
    text: 'First test todo'
}, {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333
}];

beforeEach(function (done) {
    this.timeout(5500);
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    })
        .then(() => {
            done();
        });
});

describe('POST /todos', function () {
    it('should create a new todo', (done) => {
        this.timeout(2000);
        let text = 'Test todo text.';

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should not create todo with invalid body data.', (done) => {
        request(app)
            .post('/todos')
            .send({text: ' '})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            })
    });
});

describe(('GET /todos'), () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    })
});

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        // make sure get 404
        request(app)
            .get(`/todos/${(new ObjectID).toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids', (done) => {
        // /todos/123
        request(app)
            .get(`/todos/123`)
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', function () {
    this.timeout(5500);
    it('should remove a todo', (done) => {
        let hexId = todos[1]._id.toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(hexId);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(hexId)
                    .then((todo) => {
                        expect(todo).toBeFalsy();
                        done();
                    })
                    .catch((e) => done(e));
            })
    });
    it('should should return 404 if todo not found', (done) => {
        request(app)
            .delete(`/todos/${(new ObjectID).toHexString()}`)
            .expect(404)
            .end(done);
    });
    it('should return 404 if object id is invalid' , (done) => {
        request(app)
            .delete('/todos/123abc')
            .expect(404)
            .end(done);
    });

    describe('PATCH /todos/:id', function () {
        it('should update the todo', (done) => {
            // Grab 1st id
            // update('text', set completed true
            // 200
            // text = my send
            let hexId = todos[0]._id.toHexString();
            let body = {text: 'Finish calc', completed: true};
            request(app)
                .patch(`/todos/${hexId}`)
                .send(body)
                .expect(200)
                .expect((res) => {
                    expect(res.body.todo.text).toBe(body.text);
                    expect(res.body.todo.completed).toBe(true);
                    expect(res.body.todo.completedAt).toEqual(expect.any(Number));
                })
                .end(done);
        });

        it('should clear completedAt when todo is not completed', (done) => {
            // Get second todo
            // update text, completed to false
            let hexId = todos[1]._id.toHexString();
            let body = {text: 'Finish node', completed: false};

            request(app)
                .patch(`/todos/${hexId}`)
                .send(body)
                .expect(200)
                .expect((res) => {
                    expect(res.body.todo.text).toBe(body.text);
                    expect(res.body.todo.completed).toBe(false);
                    expect(res.body.todo.completedAt).toBeNull();
                })
                .end(done);
        });
    })
});


















