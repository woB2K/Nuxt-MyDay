import { describe, expect, it } from 'vitest'
import { pinAttemptSchema, resetPinSchema, setPinSchema } from '../../../shared/schemas/settings'

describe('pin schemas', () => {
  it.each(['1234', '0000', '9999'])('принимает четыре цифры: %s', (pin) => {
    expect(setPinSchema.parse({ pin })).toEqual({ pin })
  })

  it.each(['123', '12345', '12a4', '', ' 123', '12 4'])('отвергает %j', (pin) => {
    expect(setPinSchema.safeParse({ pin }).success).toBe(false)
  })

  it('принимает текущий PIN при смене и требует от него того же формата', () => {
    expect(setPinSchema.safeParse({ pin: '1234', currentPin: '4321' }).success).toBe(true)
    expect(setPinSchema.safeParse({ pin: '1234', currentPin: '43' }).success).toBe(false)
  })

  it('в попытке разблокировки лишние поля не проходят как PIN', () => {
    expect(pinAttemptSchema.safeParse({ pin: '1234' }).success).toBe(true)
    expect(pinAttemptSchema.safeParse({}).success).toBe(false)
  })

  it('сброс требует непустой пароль', () => {
    expect(resetPinSchema.safeParse({ password: 'hunter2' }).success).toBe(true)
    expect(resetPinSchema.safeParse({ password: '' }).success).toBe(false)
  })
})
