(function() {
  'use strict';
  var jade, nodemailer;

  nodemailer = require('nodemailer');

  jade = require('jade');

  module.exports = function(ndx) {
    var callbacks, fillTemplate, from, pass, safeCallback, service, transporter, user;
    user = process.env.EMAIL_USER || ndx.settings.EMAIL_USER;
    pass = process.env.EMAIL_PASS || ndx.settings.EMAIL_PASS;
    from = process.env.EMAIL_FROM || ndx.settings.EMAIL_FROM;
    service = process.env.EMAIL_SERVICE || ndx.settings.EMAIL_SERVICE;
    fillTemplate = function(template, data) {
      return template.replace(/\{\{(.+?)\}\}/g, function(all, match) {
        var evalInContext;
        evalInContext = function(str, context) {
          return (new Function("with(this) {return " + str + "}")).call(context);
        };
        return evalInContext(match, data);
      });
    };
    callbacks = {
      send: [],
      error: []
    };
    safeCallback = function(name, obj) {
      var cb, i, len, ref, results;
      ref = callbacks[name];
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        cb = ref[i];
        results.push(cb(obj));
      }
      return results;
    };
    if (user && pass && service) {
      transporter = nodemailer.createTransport({
        service: service,
        auth: {
          user: user,
          pass: pass
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    }
    return ndx.email = {
      send: function(ctx, cb) {
        var message;
        if (user && pass && service) {
          if (process.env.EMAIL_OVERRIDE) {
            ctx.to = process.env.EMAIL_OVERRIDE;
          }
          if (!process.env.EMAIL_DISABLE) {
            message = {
              from: ctx.from || from,
              to: ctx.to,
              subject: fillTemplate(ctx.subject, ctx),
              html: jade.render(ctx.body, ctx)
            };
            console.log('sending', message);
            return transporter.sendMail(message, function(err, info) {
              if (err) {
                return console.log(err);
              }
            });
          } else {
            return console.log('mail disabled');
          }
        }
      }
    };
  };

}).call(this);

//# sourceMappingURL=index.js.map
