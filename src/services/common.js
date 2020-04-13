function successCB(data) {
  console.log('Success callback: ', data)
}

function errorCB(data) {
  console.log('Error callback: ' + data)
}

module.exports = {
  successCB,
  errorCB,
}
