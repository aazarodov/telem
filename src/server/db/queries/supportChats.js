'use strict';

const log = require('logger-file-fun-line');
const couch = require('../../db/connection');
const supportChatsSchema = require('../../schemas/db/chats/supportChats');
const supportMessagesSchema = require('../../schemas/db/chats/supportMessages');
const id = require('../../utils/_id')();
const prefix = require('../../utils/prefix');

const dbname = prefix('chats');
const db = couch.use(dbname);
const supportTitles = [];

// indexes: type, supportUnread, supportChat,pid,openDate,
// indexes: supportChat,did,closeDate,title, supportMessage,chatId,sendDate
// indexes: unread,sendDate
// updates: takeSupportChat updMessageStatus closeSupportChat

module.exports = {
  async supportTitles() {
    if (supportTitles.length) return supportTitles;
    const response = await db.find({
      selector: {
        type: 'supportTitle',
      },
      use_index: ['indexes', 'type'],
      fields: [
        'title',
      ],
      limit: 1000,
    });
    response.docs.forEach(doc => supportTitles.push(doc.title));
    return supportTitles;
  },
  async getById(_id, pid) {
    try {
      const doc = await db.get(_id);
      if ((doc.type !== 'supportChat') || (pid && pid !== doc.pid)) {
        return null;
      }
      delete doc._rev;
      const firstKey = pid || doc.did;
      const unreadMessages = await db.view('indexes', 'supportUnread', { key: [firstKey, _id] });
      if (unreadMessages.rows.length === 1) doc.unread = unreadMessages.rows[0].value;
      return doc;
    } catch (error) {
      if (error.error === 'not_found') return null;
      throw error;
    }
  },
  async list(pid, _closed, limit, bookmark) {
    const supportChats = await db.find({
      selector: {
        pid,
        openDate: { $gt: '' },
        closeDate: _closed ? { $gt: '' } : '',
      },
      fields: [
        '_id',
        'pid',
        'did',
        'title',
        'meta',
        'openDate',
        'closeDate',
      ],
      sort: [{ openDate: 'desc' }],
      use_index: ['indexes', 'supportChat,pid,openDate,closeDate'],
      limit,
      bookmark,
    });
    const unreadMessages = await db.view('indexes', 'supportUnread', { startkey: [pid], group: true });
    unreadMessages.rows.forEach((row) => {
      const docIndex = supportChats.docs.findIndex(doc => doc._id === row.key[1]);
      if (docIndex !== -1) {
        supportChats.docs[docIndex].unread = row.value;
      }
    });
    return supportChats;
  },
  async selectList(did, _titles, _new, _closed, limit, bookmark) {
    const supportChats = await db.find({
      selector: {
        did: _new ? '' : did,
        openDate: { $gt: '' },
        closeDate: _closed ? { $gt: '' } : '',
        title: { $in: _titles },
      },
      fields: [
        '_id',
        'pid',
        'did',
        'title',
        'meta',
        'openDate',
        'closeDate',
      ],
      sort: [{ openDate: 'desc' }],
      use_index: ['indexes', 'supportChat,did,openDate,closeDate,title'],
      limit,
      bookmark,
    });
    const unreadMessages = await db.view('indexes', 'supportUnread', { startkey: [did], group: true });
    unreadMessages.rows.forEach((row) => {
      const docIndex = supportChats.docs.findIndex(doc => doc._id === row.key[1]);
      if (docIndex !== -1) {
        supportChats.docs[docIndex].unread = row.value;
      }
    });
    return supportChats;
  },
  async selectAllList(_titles, _closed, limit, bookmark) {
    const supportChats = await db.find({
      selector: {
        openDate: { $gt: '' },
        closeDate: _closed ? { $gt: '' } : '',
        title: { $in: _titles },
      },
      fields: [
        '_id',
        'pid',
        'did',
        'title',
        'meta',
        'openDate',
        'closeDate',
      ],
      sort: [{ openDate: 'desc' }],
      use_index: ['indexes', 'supportChat,taken,openDate,closeDate,title'],
      limit,
      bookmark,
    });
    return supportChats;
  },
  async create(chatRaw, messageRaw) {
    const chatDoc = await supportChatsSchema.validate({ ...chatRaw, _id: id() });
    const createdChat = await db.insert(chatDoc);
    const messageDoc = await supportMessagesSchema.validate({
      ...messageRaw,
      _id: id(),
      chatId: createdChat.id,
    });
    const createdMessage = await db.insert(messageDoc);
    chatDoc._id = createdChat.id;
    messageDoc._id = createdMessage.id;
    return { ok: true, chatDoc, messageDoc };
  },
  async take(did, _id) {
    const takeRes = await db.atomic('ddoc', 'takeSupportChat', _id, { did });
    if (!takeRes.ok) return takeRes;
    const findRes = await db.find({
      selector: {
        chatId: _id,
      },
      sort: [{ sendDate: 'desc' }],
      use_index: ['indexes', 'supportMessage,chatId,sendDate'],
      limit: Number.MAX_SAFE_INTEGER,
    });
    findRes.docs.forEach((doc) => {
      doc.to = did; // eslint-disable-line no-param-reassign
    });
    let bulkRes;
    try {
      bulkRes = await db.bulk({ docs: findRes.docs });
    } catch (error) {
      return {
        ok: false,
        reason: 'bulk update error',
      };
    }
    if (bulkRes.some(val => !val.ok)) {
      return {
        ok: false,
        reason: 'bulk update some doc error',
      };
    }
    return { ok: true };
  },
  async messagesList(chatId, limit, bookmark, pid) {
    try {
      const doc = await db.get(chatId);
      if ((doc.type !== 'supportChat') || (pid && pid !== doc.pid)) {
        return null;
      }
    } catch (error) {
      if (error.error === 'not_found') return null;
      throw error;
    }
    return db.find({
      selector: {
        chatId,
      },
      fields: [
        '_id',
        'chatId',
        'type',
        'from',
        'to',
        'sendDate',
        'receivedDate',
        'deliveredDate',
        'readDate',
        'meta',
        'text',
      ],
      sort: [{ sendDate: 'desc' }],
      use_index: ['indexes', 'supportMessage,chatId,sendDate'],
      limit,
      bookmark,
    });
  },
  async unread(to, limit, bookmark) {
    return db.find({
      selector: {
        to,
      },
      fields: [
        '_id',
        'chatId',
        'sendDate',
        'receivedDate',
        'deliveredDate',
        'readDate',
        'meta',
        'text',
      ],
      sort: [{ sendDate: 'desc' }],
      use_index: ['indexes', 'unread,sendDate'],
      limit,
      bookmark,
    });
  },
  async addMessage(supportMessage) {
    let chatDoc;
    try {
      chatDoc = await db.get(supportMessage.chatId);
      if ((chatDoc.type !== 'supportChat')
      || (supportMessage.from !== chatDoc.pid && supportMessage.from !== chatDoc.did)) {
        return ['access deny', null];
      }
    } catch (error) {
      if (error.error === 'not_found') return ['not found', null];
      throw error;
    }
    const messageDoc = await supportMessagesSchema.validate({
      ...supportMessage,
      _id: id(),
      to: supportMessage.from !== chatDoc.pid ? chatDoc.pid : chatDoc.did,
    });
    const res = await db.insert(messageDoc);
    if (res.ok && res.id === messageDoc._id) {
      return [null, messageDoc];
    }
    return ['insert message error', null];
  },
  async updMessageStatus(userId, data) {
    return db.atomic('ddoc', 'updMessageStatus', data._id, { ...data, to: userId });
  },
  async closeSupportChat(userId, _id) {
    return db.atomic('ddoc', 'closeSupportChat', _id, { userId });
  },
};
