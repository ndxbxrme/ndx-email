'use strict'

nodemailer = require 'nodemailer'
jade = require 'jade'

module.exports = (ndx) ->
  user = process.env.EMAIL_USER or ndx.settings.EMAIL_USER
  pass = process.env.EMAIL_PASS or ndx.settings.EMAIL_PASS
  from = process.env.EMAIL_FROM or ndx.settings.EMAIL_FROM
  service = process.env.EMAIL_SERVICE or ndx.settings.EMAIL_SERVICE
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
      secure: false
      requireTLS: true
      tls:
        rejectUnauthorized: false
  ndx.email =
    send: (ctx, cb) ->
      if user and pass and service
        if process.env.EMAIL_OVERRIDE
          ctx.to = process.env.EMAIL_OVERRIDE
        if not process.env.EMAIL_DISABLE
          message =
            from: ctx.from or from
            to: ctx.to
            subject: fillTemplate ctx.subject, ctx
            html: jade.render ctx.body, ctx
          console.log 'sending', message
          transporter.sendMail message, (err, info) ->
            if err
              console.log err
        else
          console.log 'mail disabled'