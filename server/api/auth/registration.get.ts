import { registrationOpen } from '~~/server/utils/registration'

export default defineEventHandler(async event => ({ open: await registrationOpen(event) }))
