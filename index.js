const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

require('dotenv').config()

const Person = require('./models/person')

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('response-data', function (req, res) {
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :response-data'))

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456"
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523"
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345"
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122"
  }
]

const now = new Date()
const timeStamp = now.toUTCString()

let info = `
    <div>Phonebook has info of ${persons.length} people</div>
    <p>${timeStamp}</p>
`

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
  response.send(info)
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response) => {
  // const id = request.params.id
  // const person = persons.find(person => person.id === id)

  // if (person) {
  //   response.json(person)
  // } else {
  //   response.status(404).end()
  // }
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
})

const generateId = () => {
  const randomNum = Math.floor(Math.random() * 1000000)
  const idNum = `${randomNum}`
  return idNum
}

app.post('/api/persons', (request, response) => {
  const body = request.body
  const isDuplicate = persons.find(person => person.name === body.name)

  if (!body.name || !body.number) {
    return response.status(400).json({ // important to call return -> otherwise code would continue and send the note without content
      error: 'name or number missing'
    })
  } else if (isDuplicate) {
    return response.status(400).json({ // important to call return -> otherwise code would continue and send the note without content
      error: 'name must be unique'
    })
  }

  const person = new Person({
    // id: generateId(),
    name: body.name,
    number: body.number,
  })

  // persons = persons.concat(person)

  // response.json(person)
  person.save().then(savedNote => {
    response.json(savedNote)
  })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})