import { runNotificationTick } from '~~/server/utils/notifications/tick'
import { pushSender } from '~~/server/utils/push'

export default defineTask({
  meta: {
    name: 'notifications:tick',
    description: 'Send due reminders: spending, tasks, habits'
  },
  async run() {
    const send = pushSender()

    if (!send) return { result: 'disabled' }

    const { users, pushes } = await runNotificationTick({ db: prisma, send, now: new Date() })

    return { result: `users=${users} pushes=${pushes}` }
  }
})
