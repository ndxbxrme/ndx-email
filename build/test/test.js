(function() {
  'use strict';
  var ndx;

  ndx = {
    settings: {}
  };

  require('../index.js')(ndx);

  ndx.email.send({
    to: '',
    from: '',
    subject: 'Hey {{name}}',
    body: 'h1= name',
    name: 'kieron'
  });

}).call(this);

//# sourceMappingURL=test.js.map
