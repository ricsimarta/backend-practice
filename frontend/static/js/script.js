const rootElement = document.querySelector("#root")
let usersData = []

const skeleton = () => `
  <header></header>
  <div class="cards"></div>
`

const formComponent = () => `
  <form>
    <div>
      <input type="text" name="name" placeholder="enter name">
      <input type="password" name="password" placeholder="enter password" required>
    </div>

    <button>send</button>
  </form>
`

const userCardComponent = (userData) => `
  <div class="card">
    <h3>${userData.id}</h3>
    <h2 class="name">${userData.name}</h2>
    <h4>${userData.age}</h4>
    <span id="deleteid-${userData.id}" class="material-symbols-outlined delete">delete</span>
    <span id="editid-${userData.id}" class="material-symbols-outlined edit">edit</span>
  </div>
`

const formEventsComponent = (formElement, cardsElement) => {
  const inputNameElement = document.querySelector('input[name="name"]')
  inputNameElement.addEventListener('input', (event) => {
    if (event.data === "0" || event.data === "1" || event.data === "2") {
      console.log('cant write number')
      event.target.value = event.target.value.substring(0, event.target.value.length - 1)
    }
  })

  formElement.addEventListener('submit', (event) => {
    event.preventDefault()

    const userName = document.querySelector(`input[name="name"]`).value
    const userPassword = document.querySelector(`input[name="password"]`).value

    fetch('/users/new-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: userName,
        password: userPassword
      })
    })
      .then(res => {
        if (res.status === 201) return res.json()
        else throw Error('error at writing file')
      })
      .then(resJson => {
        /* usersData.push(userCardComponent(newUser))

        cardsElement.insertAdjacentHTML('beforeend', usersData[usersData.length - 1]) */

        console.log(resJson)
        fetchUsers(cardsElement)
      })
      .catch(err => console.log(err))
  })
}

const fetchUsers = (cardsElement) => {
  cardsElement.innerHTML = ""
  usersData = []

  fetch('/users')
    .then(res => res.json())
    .then(data => {
      usersData = data.map(user => userCardComponent(user))
      // console.log(usersData)
      cardsElement.insertAdjacentHTML("beforeend", usersData.join(""))

      const deleteElements = document.querySelectorAll('span.delete')
      deleteElements.forEach(deleteButton => deleteButton.addEventListener('click', () => {
        const deleteId = deleteButton.id.split('-')[1]

        fetch('/users/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: deleteId })
        })
          .then(res => {
            if (res.status === 200) return res.json()
            else throw Error(`error at deleting user: ${deleteId}`)
          })
          .then(resJson => {
            console.log(resJson)

            fetchUsers(cardsElement)
          })
          .catch(err => {
            rootElement.insertAdjacentHTML("afterbegin", `
            <div class="error-box">
              ${err}
            </div>`)
          })
      }))

      const editElements = document.querySelectorAll('span.edit')
      editElements.forEach(editElement => editElement.addEventListener('click', () => {
        //console.log(editElement.parentElement)

        const cardElement = editElement.parentElement

        const h2Element = cardElement.querySelector('h2')
        //console.log(h2Element)

        const userId = editElement.id.split('-')[1]
        const oldName = h2Element.innerText

        h2Element.innerHTML = `
          <input type="text" name="name" placeholder="${oldName}">
          <button id="id-${userId}" class="change">ok</button>
        `

        const changeButtonElement = cardElement.querySelector('button.change')
        changeButtonElement.addEventListener('click', () => {
          const inputElement = cardElement.querySelector('input[name="name"]')
          const newName = inputElement.value // üres input stringnél value === ""
          console.log(userId)
          console.log(newName)

          let newUserData = {
            id: userId,
            newData: {
              name: newName
            }
          }

          if (!newName) newUserData.newData.name = oldName

          fetch('/users/patch', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUserData)
          })
            .then(res => res.json())
            .then(resJson => {
              console.log(resJson)
            
              fetchUsers(cardsElement)
            })
        })
      }))
    })
}

const init = () => {
  rootElement.insertAdjacentHTML("beforeend", skeleton())

  const headerElement = document.querySelector("header")
  const cardsElement = document.querySelector(".cards")

  headerElement.insertAdjacentHTML("beforeend", formComponent())
  const formElement = document.querySelector('form')
  formEventsComponent(formElement, cardsElement)

  fetchUsers(cardsElement)
}

init()