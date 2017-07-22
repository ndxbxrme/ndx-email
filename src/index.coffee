'use strict'

nodemailer = require 'nodemailer'
jade = require 'jade'

module.exports = (ndx) ->
  user = process.env.EMAIL_USER or ndx.settings.EMAIL_USER or process.env.SMTP_USER or ndx.settings.SMTP_USER
  pass = process.env.EMAIL_PASS or ndx.settings.EMAIL_PASS or process.env.SMTP_PASS or ndx.settings.SMTP_PASS
  from = process.env.EMAIL_FROM or ndx.settings.EMAIL_FROM or process.env.SMTP_FROM or ndx.settings.SMTP_FROM
  service = process.env.EMAIL_SERVICE or ndx.settings.EMAIL_SERVICE
  smtpHost = process.env.EMAIL_HOST or ndx.settings.EMAIL_HOST or process.env.SMTP_HOST or ndx.settings.SMTP_HOST
  smtpPort = process.env.EMAIL_PORT or ndx.settings.EMAIL_PORT or process.env.SMTP_PORT or ndx.settings.SMTP_PORT or 587
  fillTemplate = (template, data) ->
    template.replace /\{\{(.+?)\}\}/g, (all, match) ->
      evalInContext = (str, context) ->
        (new Function("with(this) {return #{str}}"))
        .call context
      evalInContext match, data
  callbacks = 
    send: []
    error: []
  safeCallback = (name, obj) ->
    for cb in callbacks[name]
      cb obj
  if user and pass and service
    transporter = nodemailer.createTransport
      service: service
      auth:
        user: user
        pass: pass
  else if user and pass and smtpHost
    transporter = nodemailer.createTransport
      host: smtpHost
      port: smtpPort
      auth:
        user: user
        pass: pass
  ndx.email =
    send: (ctx, cb) ->
      if user and pass and (service or smtpHost)
        if process.env.EMAIL_OVERRIDE
          ctx.to = process.env.EMAIL_OVERRIDE
        if not process.env.EMAIL_DISABLE
          message =
            from: ctx.from or from
            to: ctx.to
            subject: fillTemplate ctx.subject, ctx
            html: jade.render ctx.body, ctx
          transporter.sendMail message, (err, info) ->
            if err
              message.err = err
              safeCallback 'error', message
            else
              safeCallback 'send', message
        else
          ctx.err = 'mail disabled'
          safeCallback 'error', ctx
      else
        ctx.err = 'user/pass/service/host not set'
        safeCallback 'error', ctx
    on: (name, callback) ->
      callbacks[name].push callback
      @
    off: (name, callback) ->
      callbacks[name].splice callbacks[name].indexOf(callback), 1
      @