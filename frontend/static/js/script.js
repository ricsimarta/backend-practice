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
    <h2>${userData.name}</h2>
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