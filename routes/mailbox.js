const express = require('express');
const router = require('express-promise-router')();
const passport = require('passport');
const passportConf = require('../passport');

const { validateBody, schemas } = require('../helpers/routehelpers');
const MailboxController = require('../controllers/mailbox');

router.route('/outbox')
    .get(passport.authenticate('jwt', { session: false }), MailboxController.outbox)

router.route('/inbox')
    .get(passport.authenticate('jwt', { session: false }), MailboxController.inbox)

router.route('/inbox/:id')
    .get(passport.authenticate('jwt', { session: false }), MailboxController.getInboxMessage)

router.route('/outbox/:id')
    .get(passport.authenticate('jwt', { session: false }), MailboxController.getOutboxMessage)

router.route('/send')
    .post(passport.authenticate('jwt', { session: false }), MailboxController.send)

router.route('/message/read/:id')
    .get(passport.authenticate('jwt', { session: false }), MailboxController.read)


router.route('/message/inbox/delete/:id')
    .get(passport.authenticate('jwt', { session: false }), MailboxController.deleteInboxMessage)

router.route('/message/inbox/delete/:id')
    .get(passport.authenticate('jwt', { session: false }), MailboxController.deleteOutboxMessage)

router.route('/message/unread/:id')
    .get(passport.authenticate('jwt', { session: false }), MailboxController.unread)

module.exports = router;