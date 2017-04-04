'use strict'

nodemailer = require 'nodemailer'
jade = require 'jade'

module.exports = (ndx) ->
  user = process.env.MAIL_USER or ndx.settings.MAIL_USER
  pass = process.env.MAIL_PASS or ndx.settings.MAIL_PASS
  from = process.env.MAIL_FROM or ndx.settings.MAIL_FROM
  service = process.env.MAIL_SERVICE or ndx.settings.MAIL_SERVICE
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
  ndx.email =
    send: (ctx, cb) ->
      if user and pass and service
        if process.env.MAIL_OVERRIDE
          ctx.to = process.env.MAIL_OVERRIDE
        if not process.env.MAIL_DISABLE
          message =
            from: ctx.from or from
            to: ctx.to
            subject: fillTemplate ctx.subject, ctx
            html: jade.render ctx.body, ctx
          transporter.sendMail message, (err, info) ->
            if err
              console.log err
        else
          console.log 'mail disabled'