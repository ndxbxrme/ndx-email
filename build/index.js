(function() {
  'use strict';
  var jade, nodemailer;

  nodemailer = require('nodemailer');

  jade = require('jade');

  module.exports = function(ndx) {
    var callbacks, fillTemplate, from, pass, safeCallback, service, smtpHost, smtpPort, transporter, user;
    user = process.env.EMAIL_USER || ndx.settings.EMAIL_USER || process.env.SMTP_USER || ndx.settings.SMTP_USER;
    pass = process.env.EMAIL_PASS || ndx.settings.EMAIL_PASS || process.env.SMTP_PASS || ndx.settings.SMTP_PASS;
    from = process.env.EMAIL_FROM || ndx.settings.EMAIL_FROM || process.env.SMTP_FROM || ndx.settings.SMTP_FROM;
    service = process.env.EMAIL_SERVICE || ndx.settings.EMAIL_SERVICE;
    smtpHost = process.env.EMAIL_HOST || ndx.settings.EMAIL_HOST || process.env.SMTP_HOST || ndx.settings.SMTP_HOST;
    smtpPort = process.env.EMAIL_PORT || ndx.settings.EMAIL_PORT || process.env.SMTP_PORT || ndx.settings.SMTP_PORT || 587;
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
        }
      });
    } else if (user && pass && smtpHost) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        auth: {
          user: user,
          pass: pass
        }
      });
    }
    return ndx.email = {
      send: function(ctx, cb) {
        var message;
        if (user && pass && (service || smtpHost)) {
          ctx.orig = ctx.to;
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
            if (ctx.attachments) {
              message.attachments = ctx.attachments;
            }
            return transporter.sendMail(message, function(err, info) {
              if (err) {
                message.err = err;
                return safeCallback('error', message);
              } else {
                return safeCallback('send', message);
              }
            });
          } else {
            ctx.err = 'mail disabled';
            return safeCallback('error', ctx);
          }
        } else {
          ctx.err = 'user/pass/service/host not set';
          return safeCallback('error', ctx);
        }
      },
      on: function(name, callback) {
        callbacks[name].push(callback);
        return this;
      },
      off: function(name, callback) {
        callbacks[name].splice(callbacks[name].indexOf(callback), 1);
        return this;
      }
    };
  };

}).call(this);

//# sourceMappingURL=index.js.map
