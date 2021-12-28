const express = require('express')
const { v4: uuidV4 } = require('uuid')

const app = express()
app.use(express.json())

const costumers = []

app.post('/account', (request, response) => {
  const { cpf, name } = request.body

  const costumerAlreadyExists = costumers.some(costumer => costumer.cpf === cpf)

  if(costumerAlreadyExists) return response.status(400).json({ error: "Costumer already exists" })

  costumers.push({
    cpf,
    name,
    id: uuidV4(),
    statement: []
  })

  return response.status(200).send()
})

app.listen(3333)