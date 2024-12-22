const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

require('dotenv').config()

const Person = require('./models/person')

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

morgan.token('response-data', function (req, res) {
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :response-data'))

let persons = []

const now = new Date()
const timeStamp = now.toUTCString()

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

let info = `
    <div>Phonebook has info of ${persons.length} people</div>
    <p>${timeStamp}</p>
`
app.get('/info', (request, response) => {
  response.send(info)
})

app.get('/api/persons/:id', (request, response, next) => {
  // const id = request.params.id
  // const person = persons.find(person => person.id === id)

  // if (person) {
  //   response.json(person)
  // } else {
  //   response.status(404).end()
  // }
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

const generateId = () => {
  const randomNum = Math.floor(Math.random() * 1000000)
  const idNum = `${randomNum}`
  return idNum
}

app.post('/api/persons', (request, response) => {
  const body = request.body
  // const isDuplicate = persons.find(person => person.name === body.name)

  // if (!body.name || !body.number) {
  //   return response.status(400).json({ // important to call return -> otherwise code would continue and send the note without content
  //     error: 'name or number missing'
  //   })
  // } else if (isDuplicate) {
  //   return response.status(400).json({ // important to call return -> otherwise code would continue and send the note without content
  //     error: 'name must be unique'
  //   })
  // }

  if (body.name === undefined) {
    return response.status(400).json({ // important to call return -> otherwise code would continue and send the note without content
      error: 'name missing'
    })
  }

  const person = new Person({
    // id: generateId(),
    name: body.name,
    number: body.number,
  })

  // persons = persons.concat(person)

  // response.json(person)
  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  //   const id = request.params.id
  //   persons = persons.filter(person => person.id !== id)

  //   response.status(204).end()

  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})