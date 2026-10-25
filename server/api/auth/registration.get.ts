import { registrationOpen } from '~~/server/utils/registration'

export default defineEventHandler(event => ({ open: registrationOpen(event) }))
