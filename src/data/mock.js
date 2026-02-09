export function uid(prefix='id'){
  return `${prefix}_${Math.random().toString(16).slice(2,9)}${Date.now().toString(16).slice(-5)}`
}

export function todayISO(){
  const d = new Date()
  d.setHours(0,0,0,0)
  return d.toISOString().slice(0,10)
}
export function addDaysISO(iso, days){
  const d = new Date(iso + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0,10)
}

export function createMockData(){
  const t0 = todayISO()
  const items = [
    {
      id: uid('i'), type:'task', title:'Triage inbox notes',
      status:'open', nextActionDate:t0, dueDate:addDaysISO(t0,2),
      energy:'shallow', estimateMin:'15', person:'',
      meetingId:'', blockers:[],
      log:[{ id: uid('l'), ts: Date.now()-86400000*2, text:'Created (task)' }]
    },
    {
      id: uid('i'), type:'chase', title:'Chase legal on NDA wording',
      status:'waiting', nextActionDate:addDaysISO(t0,1), dueDate:'',
      energy:'', estimateMin:'', person:'Legal',
      meetingId:'', blockers:[],
      log:[
        { id: uid('l'), ts: Date.now()-86400000*3, text:'Created (chase)' },
        { id: uid('l'), ts: Date.now()-86400000*1, text:'Chased by email' },
      ]
    },
    {
      id: uid('i'), type:'untriaged', title:'Note: clarify card deposit edge case',
      status:'open', nextActionDate:'', dueDate:'',
      energy:'', estimateMin:'', person:'',
      meetingId:'m_1', blockers:[],
      log:[{ id: uid('l'), ts: Date.now()-86400000, text:'Quick note added (from meeting)' }]
    }
  ]

  const meetings = [
    {
      id:'m_1',
      title:'Payments stand-up',
      date:t0,
      time:'10:00',
      agenda:'Payouts rollout, deposit UX, ops blockers',
      decisions:'',
      agreements:'',
      actions:[]
    },
    {
      id:'m_2',
      title:'Design review',
      date:addDaysISO(t0,-1),
      time:'16:00',
      agenda:'Nudge nav + triage flows',
      decisions:'Use HashRouter for Pages',
      agreements:'Keep views lightweight',
      actions:[]
    }
  ]

  return { items, meetings }
}
