'use strict'

ndx = 
  settings: {}
require('../index.js') ndx

ndx.email.send
  to: ''
  from: ''
  subject: 'Hey {{name}}'
  body: 'h1= name'
  name: 'kieron'