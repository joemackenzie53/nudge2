import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { createMockData, uid, todayISO, addDaysISO, nextOccurrencesForTemplate } from '../data/mock'

const KEY = 'nudge_data_v1'
const Ctx = createContext(null)

function ensureShape(parsed){
  if(!parsed || typeof parsed !== 'object') return null
  if(!Array.isArray(parsed.items)) return null
  if(!Array.isArray(parsed.meetings)) return null
  if(!Array.isArray(parsed.recurring)) parsed.recurring = []
  return parsed
}

function hydrate(state){
  // ensure upcoming meeting instances exist for templates
  // (keeps Today’s meetings populated)
  const byKey = new Set((state.meetings || []).map(m => `${m.templateId || ''}__${m.date || ''}__${m.time || ''}`))
  const meetings = (state.meetings || []).slice()

  for(const t of (state.recurring || [])){
    const occ = nextOccurrencesForTemplate(t, 30) // next 30 days window
    for(const date of occ){
      const key = `${t.id}__${date}__${t.time || ''}`
      if(byKey.has(key)) continue

      // create meeting instance with agenda copied from template.nextAgenda
      const m = {
        id: uid('m'),
        templateId: t.id,
        title: t.title || 'Meeting',
        date,
        time: t.time || '',
        agendaItems: (t.nextAgenda || []).map(a => ({ id: uid('a'), text: a.text || '', done: false })),
        decisions: '',
        actions: '',
        notes: '',
      }
      meetings.push(m)
      byKey.add(key)
    }
  }

  // keep sorted-ish, but leave ordering to UI; just return updated state
  return { ...state, meetings }
}

function load(){
  try{
    const raw = localStorage.getItem(KEY)
    if(!raw){
      const seeded = createMockData()
      return hydrate(seeded)
    }
    const parsed = ensureShape(JSON.parse(raw))
    if(!parsed){
      const seeded = createMockData()
      return hydrate(seeded)
    }
    return hydrate(parsed)
  }catch{
    const seeded = createMockData()
    return hydrate(seeded)
  }
}

function save(state){
  localStorage.setItem(KEY, JSON.stringify(state))
}

function reducer(state, action){
  switch(action.type){
    case 'RESET': {
      return hydrate(createMockData())
    }

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
      return hydrate({ ...state, meetings })
    }

    case 'UPSERT_TEMPLATE':{
      const t = action.template
      const idx = (state.recurring || []).findIndex(x=>x.id===t.id)
      const recurring = idx>=0 ? state.recurring.map(x=> x.id===t.id ? t : x) : [t, ...(state.recurring||[])]
      return hydrate({ ...state, recurring })
    }

    case 'DELETE_TEMPLATE':{
      const id = action.id
      const recurring = (state.recurring || []).filter(t=>t.id!==id)
      // keep meeting instances even after delete for now (history), but they’ll stop generating
      return hydrate({ ...state, recurring })
    }

    default:
      return state
  }
}

export function DataProvider({ children }){
  const [state, dispatch] = useReducer(reducer, undefined, load)
  useEffect(()=>{ save(state) }, [state])

  const api = useMemo(() => ({
    state,
    dispatch,

    // -----------------------
    // Items
    // -----------------------
    createQuickNote: ({ title, meetingId='' })=>{
      const item = {
        id: uid('i'),
        type:'untriaged',
        title: title.trim(),
        status:'open',
        nextActionDate:'',
        dueDate:'',
        energy:'',
        estimateMin:'',
        person:'',
        meetingId,
        blockers:[],
        // new fields (safe to exist on all item types)
        area:'',
        notes:'',
        who:'',
        where:'',
        log:[{ id: uid('l'), ts: Date.now(), text: meetingId ? 'Quick note added (from meeting)' : 'Quick note added' }],
      }
      dispatch({ type:'UPSERT_ITEM', item })
      return item
    },

    createItem: ({ type, title, meetingId='' })=>{
      const t0 = todayISO()
      const item = {
        id: uid('i'),
        type,
        title:title.trim(),
        status:'open',
        nextActionDate: type==='chase' ? addDaysISO(t0,1) : t0,
        dueDate:'',
        energy: type==='task' ? 'shallow' : '',
        estimateMin: type==='task' ? '15' : '',
        person: '',
        meetingId,
        blockers:[],
        // new fields
        area: type==='task' ? '' : '',
        notes: '',
        who: type==='chase' ? 'Someone' : '',
        where: type==='chase' ? 'Email / Slack' : '',
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
        dueDate: toType==='task' ? (item.dueDate || '') : item.dueDate || '',
        energy: toType==='task' ? (item.energy || 'shallow') : '',
        estimateMin: '', // no longer used, keep blank
        person: '',
        // chase fields
        who: toType==='chase' ? (item.who || item.person || 'Someone') : '',
        where: toType==='chase' ? (item.where || 'Email / Slack') : '',
        // task fields
        area: toType==='task' ? (item.area || '') : '',
        notes: toType==='task' ? (item.notes || '') : item.notes || '',
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

    // -----------------------
    // Meetings (instances)
    // -----------------------
    createMeeting: ()=>{
      const t0 = todayISO()
      const m = {
        id: uid('m'),
        templateId: '',
        title: 'New meeting',
        date: t0,
        time: '',
        agendaItems: [],
        decisions: '',
        actions: '',
        notes: '',
      }
      dispatch({ type:'UPSERT_MEETING', meeting: m })
      return m
    },

    updateMeeting: (meeting)=>{
      dispatch({ type:'UPSERT_MEETING', meeting })
    },

    // Agenda checklist on meeting instance
    addMeetingAgendaItem: ({ meetingId, text })=>{
      const m = state.meetings.find(x=>x.id===meetingId)
      if(!m) return
      const agendaItems = [...(m.agendaItems || []), { id: uid('a'), text, done:false }]
      dispatch({ type:'UPSERT_MEETING', meeting: { ...m, agendaItems } })
    },

    toggleMeetingAgendaDone: ({ meetingId, agendaId })=>{
      const m = state.meetings.find(x=>x.id===meetingId)
      if(!m) return
      const agendaItems = (m.agendaItems || []).map(a => a.id===agendaId ? { ...a, done: !a.done } : a)
      dispatch({ type:'UPSERT_MEETING', meeting: { ...m, agendaItems } })
    },

    updateMeetingAgendaText: ({ meetingId, agendaId, text })=>{
      const m = state.meetings.find(x=>x.id===meetingId)
      if(!m) return
      const agendaItems = (m.agendaItems || []).map(a => a.id===agendaId ? { ...a, text } : a)
      dispatch({ type:'UPSERT_MEETING', meeting: { ...m, agendaItems } })
    },

    removeMeetingAgendaItem: ({ meetingId, agendaId })=>{
      const m = state.meetings.find(x=>x.id===meetingId)
      if(!m) return
      const agendaItems = (m.agendaItems || []).filter(a => a.id!==agendaId)
      dispatch({ type:'UPSERT_MEETING', meeting: { ...m, agendaItems } })
    },

    // -----------------------
    // Recurring templates
    // -----------------------
    createTemplate: ()=>{
      const t = {
        id: uid('t'),
        title: 'New recurring meeting',
        time: '10:00',
        cadence: 'weekly', // daily | weekly | fortnightly | custom
        daysOfWeek: [1], // Mon default (0=Sun)
        nextAgenda: [],
      }
      dispatch({ type:'UPSERT_TEMPLATE', template: t })
      return t
    },

    updateTemplate: (template)=>{
      dispatch({ type:'UPSERT_TEMPLATE', template })
    },

    upsertTemplate: (template)=>{
      dispatch({ type:'UPSERT_TEMPLATE', template })
    },

    deleteTemplate: (templateId)=>{
      dispatch({ type:'DELETE_TEMPLATE', id: templateId })
    },

    // template "next meeting agenda"
    addTemplateNextAgendaItem: ({ templateId, text })=>{
      const t = (state.recurring || []).find(x=>x.id===templateId)
      if(!t) return
      const nextAgenda = [...(t.nextAgenda || []), { id: uid('na'), text }]
      dispatch({ type:'UPSERT_TEMPLATE', template: { ...t, nextAgenda } })
    },

    updateTemplateNextAgendaText: ({ templateId, agendaId, text })=>{
      const t = (state.recurring || []).find(x=>x.id===templateId)
      if(!t) return
      const nextAgenda = (t.nextAgenda || []).map(a => a.id===agendaId ? { ...a, text } : a)
      dispatch({ type:'UPSERT_TEMPLATE', template: { ...t, nextAgenda } })
    },

    removeTemplateNextAgendaItem: ({ templateId, agendaId })=>{
      const t = (state.recurring || []).find(x=>x.id===templateId)
      if(!t) return
      const nextAgenda = (t.nextAgenda || []).filter(a => a.id!==agendaId)
      dispatch({ type:'UPSERT_TEMPLATE', template: { ...t, nextAgenda } })
    },
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
