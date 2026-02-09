import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { createMockData, uid, todayISO, addDaysISO } from '../data/mock'

const KEY = 'nudge_data_v1'
const Ctx = createContext(null)

function load(){
  try{
    const raw = localStorage.getItem(KEY)
    if(!raw) return createMockData()
    const parsed = JSON.parse(raw)
    if(!parsed || !Array.isArray(parsed.items) || !Array.isArray(parsed.meetings)) return createMockData()
    return parsed
  }catch{
    return createMockData()
  }
}
function save(state){
  localStorage.setItem(KEY, JSON.stringify(state))
}

function reducer(state, action){
  switch(action.type){
    case 'RESET': return createMockData()
    case 'UPSERT_ITEM':{
      const item = action.item
      const idx = state.items.findIndex(i=>i.id===item.id)
      const items = idx>=0 ? state.items.map(i=> i.id===item.id ? item : i) : [item, ...state.items]
      return { ...state, items }
    }
    case 'DELETE_ITEM':{
      const id = action.id
      const items = state.items.filter(i=>i.id!==id).map(i=>{
        if(i.blockers?.includes(id)) return { ...i, blockers: i.blockers.filter(b=>b!==id) }
        return i
      })
      return { ...state, items }
    }
    case 'UPSERT_MEETING':{
      const m = action.meeting
      const idx = state.meetings.findIndex(x=>x.id===m.id)
      const meetings = idx>=0 ? state.meetings.map(x=> x.id===m.id ? m : x) : [m, ...state.meetings]
      return { ...state, meetings }
    }
    default: return state
  }
}

export function DataProvider({ children }){
  const [state, dispatch] = useReducer(reducer, undefined, load)
  useEffect(()=>{ save(state) }, [state])

  const api = useMemo(()=>({
    state, dispatch,

    createQuickNote: ({ title, meetingId='' })=>{
      const item = {
        id: uid('i'), type:'untriaged', title: title.trim(), status:'open',
        nextActionDate:'', dueDate:'', energy:'', estimateMin:'', person:'',
        meetingId, blockers:[],
        log:[{ id: uid('l'), ts: Date.now(), text: meetingId ? 'Quick note added (from meeting)' : 'Quick note added' }],
      }
      dispatch({ type:'UPSERT_ITEM', item })
      return item
    },

    createItem: ({ type, title, meetingId='' })=>{
      const t0 = todayISO()
      const item = {
        id: uid('i'), type, title:title.trim(), status:'open',
        nextActionDate: type==='chase' ? addDaysISO(t0,1) : t0,
        dueDate:'',
        energy: type==='task' ? 'shallow' : '',
        estimateMin: type==='task' ? '15' : '',
        person: type==='chase' ? 'Someone' : '',
        meetingId, blockers:[],
        log:[{ id: uid('l'), ts: Date.now(), text: `Created (${type})` }],
      }
      dispatch({ type:'UPSERT_ITEM', item })
      return item
    },

    convertType: ({ itemId, toType })=>{
      const item = state.items.find(i=>i.id===itemId)
      if(!item) return
      const log = [{ id: uid('l'), ts: Date.now(), text: `Converted to ${toType}` }, ...(item.log||[])]
      const patch = {
        type: toType,
        nextActionDate: toType==='chase' ? addDaysISO(todayISO(),1) : todayISO(),
        energy: toType==='task' ? (item.energy || 'shallow') : '',
        estimateMin: toType==='task' ? (item.estimateMin || '15') : '',
        person: toType==='chase' ? (item.person || 'Someone') : '',
        log,
      }
      dispatch({ type:'UPSERT_ITEM', item: { ...item, ...patch } })
    },

    updateItem: (item)=>{
      dispatch({ type:'UPSERT_ITEM', item })
    },

    addLog: ({ itemId, text })=>{
      const item = state.items.find(i=>i.id===itemId)
      if(!item) return
      const log = [{ id: uid('l'), ts: Date.now(), text }, ...(item.log||[])]
      dispatch({ type:'UPSERT_ITEM', item: { ...item, log } })
    },

    snooze: (itemId, days)=>{
      const item = state.items.find(i=>i.id===itemId)
      if(!item) return
      const base = item.nextActionDate || todayISO()
      const nextActionDate = addDaysISO(base, days)
      const log = [{ id: uid('l'), ts: Date.now(), text: `Snoozed ${days}d` }, ...(item.log||[])]
      dispatch({ type:'UPSERT_ITEM', item: { ...item, nextActionDate, log } })
    },

    upsertMeeting: (meeting)=>{
      dispatch({ type:'UPSERT_MEETING', meeting })
    }
  }), [state])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useData(){
  const ctx = useContext(Ctx)
  if(!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}

export const TYPES = [
  { value:'untriaged', label:'Untriaged' },
  { value:'task', label:'Task' },
  { value:'chase', label:'Chase' },
]
export const STATUSES = [
  { value:'open', label:'Open' },
  { value:'waiting', label:'Waiting' },
  { value:'done', label:'Done' },
]
export const ENERGIES = [
  { value:'shallow', label:'Shallow' },
  { value:'deep', label:'Deep' },
]
