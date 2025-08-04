fetch('http:/localhost:5754/api/auth', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: "test1", password: "fd.524c0321d302bd63cd4dcb56f0430b16be3cee5119dedc950271e1296944af83586326565db12b0a4caa65d7b83c8c11b738fc11b390a256f22f798fc72f7e1d", preHashed: true })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
fetch('http:/localhost:5754/api/auth', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: "test1/new", password: "FD123!", preHashed: false })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));