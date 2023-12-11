/* IMPORTS */
const express = require('express')
const path = require('path')
const fs = require('fs')

/* app néven elindítjuk az express modulunkat */
const app = express()

/* meghatározzuk a "port" változót */
const port = 3000

/* middleware, ami parse-olja a json-t -> ehhez a requestnél be kell állítani a headers-ben a Content-Type: application/json headert */
app.use(express.json())

/* a localhost:port/ vagy 127.0.0.1:port/ felkeresésekor elérhetővé tesszük az index.html fájlunkat*/
app.get('/', (req, res) => {
  /* elküldjük az adott helyen lévő fájlunkat */
  res.sendFile(path.join(__dirname, '/frontend/index.html'))
})

/* a localhost:port/style.css vagy 127.0.0.1:port/style.css felkeresésekor elérhetővé tesszük a style.css fájlunkat*/
app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, '/frontend/static/css/style.css'))
})

app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, '/frontend/static/js/script.js'))
})

/* /public címen elérhetővé tesszük a /frontend/static mappánk tartalmát */
app.use('/public', express.static(path.join(__dirname, '/frontend/static')))

app.get('/users', (req, res) => {
  res.sendFile(path.join(__dirname, '/data/users.json'))
})

app.get('/users/:userid', (req, res) => {
  // res.send(req.params.userid)
  // const userId = Number(req.params.userid)

  /* a bejövő paramétert átalakítom számmá (megpróbálom) */
  const userId = parseInt(req.params.userid)

  /* lecsekkolom, hogy sikerült-e átalakítani számmá */
  if (isNaN(userId)) {
    console.log(`userid is not a number: ${req.params.userid}`)

    /* ha nem sikerült, küldök egy hibát a frontendnek */
    res.status(400).json('userId must be a number!!!')

  } else { /* ha sikerült átalakítani, futtatom tovább a kódot */
    console.log('reading file...')

    /* beolvasom a users.json fájlt */
    fs.readFile(path.join(__dirname, '/data/users.json'), 'utf8', (err, data) => {
      /* ha hibát találtam a fájl olvasás közben */
      if (err) {
        console.log('error at reading file: ', err)

        res.status(500).json('error at reading file')
      } else { /* ha nincs hiba, akkor van data */
        console.log(`reading file was successful, searching for user id: ${userId}`)

        /* a data értéke STRING, átalakítom JS-ben használható típussá (object, array) */
        const users = JSON.parse(data)

        /* megkeresem az adott userId-t a users adatban */
        const foundUser = users.find((user) => user.id === userId)

        if (foundUser) { /* TRUTHY értéket keresek pl. object { id: 2, name: 'John Doe' } */
          console.log(`found user id: ${userId}, data: ${foundUser}`)

          res.status(200).json(foundUser)
        } else { /* FALSY értéke van pl. undefined */
          console.log(`user id: ${userId} was not found`)

          /* ha a find undefined-dal tér vissza, akkor nincs adott ID a users-ben */
          res.status(404).json(`user id: ${userId} was not found`)
        }
      }
    })
  }
})

app.post('/users/new-user', (req, res) => {
  console.dir(req.body)
  const newUserData = req.body

  fs.readFile(path.join(__dirname, '/data/users.json'), 'utf8', (err, data) => {
    if (err) {
      console.log('error at reading file: ', err)

      res.status(500).json('error at reading file')
    } else {
      const users = JSON.parse(data) // users === array !!!
      const newUser = {
        id: users[users.length - 1].id + 1,
        name: newUserData.name
      }

      users.push(newUser)

      fs.writeFile(path.join(__dirname, '/data/users.json'), JSON.stringify(users, null, 2), (err) => {
        if (err) {
          console.log(`error at writing file: ${err}`)
    
          res.json(`error at writing file: ${err}`)
        } else {
          console.log(`successfully updated users with: ${JSON.stringify(newUser)}`)
    
          res.json(newUser)
        }
      })
    }
  })
})

/* elkezdi figyelni az adott portot a számítógépen (localhost vagy 127.0.0.1) */
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})






