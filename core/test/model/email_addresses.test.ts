import test from 'ava'

import * as fs from 'fs'
import Model from '../../src/model/model'
import * as bunyan from 'bunyan'
import Config from '../../src/config'
import { Translation } from '../../src/model/translation'
import { NoSuchEntryError, AuthenticationError } from '../../src/model/errors'
import * as uuid from 'uuid/v4'

import { createEmailAddress, createUser } from '../test_utils'

const config: Config = JSON.parse(fs.readFileSync('config.test.json', {encoding: 'utf-8'}))

const log = bunyan.createLogger({
  name: config.instanceName,
  level: config.logLevel,
})

const model = new Model(config.postgresql, log)

test('create extra email', async t => {
  await model.pgDo(async c => {
    const userIdx = await createUser(c, model)
    const emailAddressIdx = await createEmailAddress(c, model)

    await model.emailAddresses.validate(c, userIdx, emailAddressIdx)

    const query = 'SELECT * FROM email_addresses WHERE idx = $1'
    const result = await c.query(query, [emailAddressIdx])
    t.is(result.rows[0].owner_idx, userIdx)
  })
})