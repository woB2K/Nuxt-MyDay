import type { InstanceInfo } from '~~/shared/types'
import { registrationOpen } from '~~/server/utils/registration'

export default defineEventHandler(async (event): Promise<InstanceInfo> => {
  const { demo, demoEmail, demoPassword } = useRuntimeConfig(event)

  return {
    registration: await registrationOpen(event),
    demo: String(demo) === 'true' ? { email: demoEmail, password: demoPassword } : null
  }
})
