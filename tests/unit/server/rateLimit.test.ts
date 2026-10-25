import type { H3Event } from 'h3'
import { describe, expect, it } from 'vitest'
import { clientIp } from '../../../server/utils/rateLimit'

function request(headers: Record<string, string>, remote = '172.18.0.1'): H3Event {
  return {
    node: { req: { headers, socket: { remoteAddress: remote } } },
    context: {}
  } as unknown as H3Event
}

describe('clientIp', () => {
  it('за одним прокси берёт последний адрес X-Forwarded-For, а не тот, что прислал клиент', () => {
    expect(clientIp(request({ 'x-forwarded-for': '6.6.6.6, 203.0.113.7' }), { proxyHops: 1, clientIpHeader: '' })).toBe('203.0.113.7')
  })

  it('за цепочкой прокси отсчитывает адрес клиента с конца по числу прокси', () => {
    expect(clientIp(request({ 'x-forwarded-for': '6.6.6.6, 203.0.113.7, 198.51.100.2' }), { proxyHops: 2, clientIpHeader: '' })).toBe('203.0.113.7')
  })

  it('без прокси не верит X-Forwarded-For и берёт адрес сокета', () => {
    expect(clientIp(request({ 'x-forwarded-for': '6.6.6.6' }), { proxyHops: 0, clientIpHeader: '' })).toBe('172.18.0.1')
  })

  it('заданный заголовок внешнего прокси главнее X-Forwarded-For', () => {
    const event = request({ 'cf-connecting-ip': '203.0.113.9', 'x-forwarded-for': '6.6.6.6, 10.0.0.2' })

    expect(clientIp(event, { proxyHops: 1, clientIpHeader: 'cf-connecting-ip' })).toBe('203.0.113.9')
  })

  it('если цепочка короче числа прокси, берёт адрес сокета', () => {
    expect(clientIp(request({ 'x-forwarded-for': '203.0.113.7' }), { proxyHops: 2, clientIpHeader: '' })).toBe('172.18.0.1')
  })
})
