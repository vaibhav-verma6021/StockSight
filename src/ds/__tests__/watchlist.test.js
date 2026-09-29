import { describe, it, expect } from 'vitest'
import { DoublyLinkedList, Node, Watchlist } from '../watchlist.js'

describe('DoublyLinkedList', () => {
  it('starts empty with linked sentinels', () => {
    const list = new DoublyLinkedList()
    expect(list.length).toBe(0)
    expect(list.head.next).toBe(list.tail)
    expect(list.tail.prev).toBe(list.head)
    expect(list.removeLast()).toBeNull()
  })

  it('removing the only node leaves a clean empty list', () => {
    const list = new DoublyLinkedList()
    const node = new Node('AAPL')
    list.addToFront(node)
    list.removeNode(node)
    expect(list.length).toBe(0)
    expect(list.toArray()).toEqual([])
    expect(list.head.next).toBe(list.tail)
    expect(list.tail.prev).toBe(list.head)
  })
})

describe('Watchlist', () => {
  it('empty watchlist', () => {
    const w = new Watchlist()
    expect(w.toArray()).toEqual([])
    expect(w.size()).toBe(0)
    expect(w.has('AAPL')).toBe(false)
    expect(w.remove('AAPL')).toBe(false)
    expect(w.moveToFront('AAPL')).toBe(false)
  })

  it('adds newest first', () => {
    const w = new Watchlist()
    w.add('AAPL')
    w.add('MSFT')
    w.add('NVDA')
    expect(w.toArray()).toEqual(['NVDA', 'MSFT', 'AAPL'])
    expect(w.has('MSFT')).toBe(true)
  })

  it('adding an existing ticker moves it to the front without duplicating', () => {
    const w = new Watchlist()
    w.add('AAPL')
    w.add('MSFT')
    w.add('AAPL')
    expect(w.toArray()).toEqual(['AAPL', 'MSFT'])
    expect(w.size()).toBe(2)
  })

  it('removes the only node', () => {
    const w = new Watchlist()
    w.add('AAPL')
    expect(w.remove('AAPL')).toBe(true)
    expect(w.toArray()).toEqual([])
    expect(w.has('AAPL')).toBe(false)
  })

  it('removes head, tail and middle nodes', () => {
    const w = new Watchlist()
    ;['A', 'B', 'C', 'D'].forEach((t) => w.add(t)) // D C B A
    w.remove('D') // head
    expect(w.toArray()).toEqual(['C', 'B', 'A'])
    w.remove('A') // tail
    expect(w.toArray()).toEqual(['C', 'B'])
    w.add('E')
    w.remove('C') // middle
    expect(w.toArray()).toEqual(['E', 'B'])
  })

  it('moveToFront reorders, and is a no-op for the current head', () => {
    const w = new Watchlist()
    ;['A', 'B', 'C'].forEach((t) => w.add(t)) // C B A
    w.moveToFront('A')
    expect(w.toArray()).toEqual(['A', 'C', 'B'])
    w.moveToFront('A')
    expect(w.toArray()).toEqual(['A', 'C', 'B'])
  })

  it('evicts the least recently viewed ticker when over capacity', () => {
    const w = new Watchlist(3)
    w.add('A')
    w.add('B')
    w.add('C') // C B A
    w.moveToFront('A') // A C B, so B is now least recent
    expect(w.add('D')).toBe('B')
    expect(w.toArray()).toEqual(['D', 'A', 'C'])
    expect(w.has('B')).toBe(false)
    expect(w.size()).toBe(3)
  })

  it('returns null when nothing is evicted', () => {
    const w = new Watchlist(2)
    expect(w.add('A')).toBeNull()
    expect(w.add('B')).toBeNull()
    expect(w.add('A')).toBeNull() // re-add is just a move
  })

  it('capacity 1 always keeps only the latest', () => {
    const w = new Watchlist(1)
    w.add('A')
    expect(w.add('B')).toBe('A')
    expect(w.toArray()).toEqual(['B'])
  })

  it('defaults to capacity 10', () => {
    const w = new Watchlist()
    for (let i = 0; i < 12; i++) w.add(`T${i}`)
    expect(w.size()).toBe(10)
    expect(w.has('T0')).toBe(false)
    expect(w.has('T1')).toBe(false)
    expect(w.toArray()[0]).toBe('T11')
  })
})
