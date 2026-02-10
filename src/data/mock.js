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

export function dowFromISO(iso){
  // 0=Sun ... 6=Sat in local time (fine for prototype)
  const d = new Date(iso + 'T00:00:00')
  return d.getDay()
}

export function nextOccurrencesForTemplate(t, daysAhead=30){
  const start = todayISO()
  const out = []
  for(let k=0;k<=daysAhead;k++){
    const date = addDaysISO(start, k)
    const dow = dowFromISO(date)

    if(t.cadence === 'daily'){
      out.push(date)
      continue
    }

    if(t.cadence === 'fortnightly'){
      // simple prototype rule: every 14 days starting today
      if(k % 14 === 0) out.push(date)
      continue
    }

    // weekly/custom: match selected daysOfWeek
    if(t.cadence === 'weekly' || t.cadence === 'custom'){
      const set = new Set(t.daysOfWeek || [])
      if(set.has(dow)) out.push(date)
      continue
    }
  }
  return out
}

export function createMockData(){
  const t0 = todayISO()

  // Recurring templates
  const recurring = [
    {
      id: 't_payments',
      title: 'Payments stand-up',
      time: '10:00',
      cadence: 'weekly',
      daysOfWeek: [1,3,5], // Mon/Wed/Fri
      nextAgenda: [
        { id: uid('na'), text: 'Payouts rollout status' },
        { id: uid('na'), text: 'Deposit UX blockers' },
      ],
    },
    {
      id: 't_design',
      title: 'Design review',
      time: '16:00',
      cadence: 'weekly',
      daysOfWeek: [4], // Thu
      nextAgenda: [
        { id: uid('na'), text: 'Navigation / IA changes' },
        { id: uid('na'), text: 'Prototype feedback + next iteration' },
      ],
    },
  ]

  // Items (tasks/chases/untriaged)
  const items = [
    {
      id: uid('i'),
      type:'task',
      title:'Triage inbox notes',
      status:'open',
      nextActionDate:t0,
      dueDate:addDaysISO(t0,2),
      energy:'shallow',
      estimateMin:'',
      person:'',
      meetingId:'',
      blockers:[],
      area:'Admin',
      notes:'Do a quick scan + convert anything actionable into task/chase.',
      who:'',
      where:'',
      log:[{ id: uid('l'), ts: Date.now()-86400000*2, text:'Created (task)' }],
    },
    {
      id: uid('i'),
      type:'chase',
      title:'Chase legal on NDA wording',
      status:'waiting',
      nextActionDate:addDaysISO(t0,1),
      dueDate:'',
      energy:'',
      estimateMin:'',
      person:'',
      meetingId:'',
      blockers:[],
      who:'Legal',
      where:'Email thread',
      area:'',
      notes:'',
      log:[
        { id: uid('l'), ts: Date.now()-86400000*3, text:'Created (chase)' },
        { id: uid('l'), ts: Date.now()-86400000*1, text:'Chased by email' },
      ],
    },
    {
      id: uid('i'),
      type:'untriaged',
      title:'Note: clarify card deposit edge case',
      status:'open',
      nextActionDate:'',
      dueDate:'',
      energy:'',
      estimateMin:'',
      person:'',
      meetingId:'m_1',
      blockers:[],
      area:'',
      notes:'',
      who:'',
      where:'',
      log:[{ id: uid('l'), ts: Date.now()-86400000, text:'Quick note added (from meeting)' }],
    }
  ]

  // Meetings (instances)
  const meetings = [
    {
      id:'m_1',
      templateId:'t_payments',
      title:'Payments stand-up',
      date:t0,
      time:'10:00',
      agendaItems: [
        { id: uid('a'), text:'Payouts rollout status', done:false },
        { id: uid('a'), text:'Deposit UX blockers', done:false },
        { id: uid('a'), text:'Ops handover notes', done:false },
      ],
      decisions:'',
      actions:'',
      notes:'',
    },
    {
      id:'m_2',
      templateId:'t_design',
      title:'Design review',
      date:addDaysISO(t0,-1),
      time:'16:00',
      agendaItems: [
        { id: uid('a'), text:'Nudge nav + triage flows', done:true },
        { id: uid('a'), text:'Meeting template concept', done:true },
      ],
      decisions:'Use HashRouter for Pages',
      actions:'Update meeting detail to editable agenda + notes.',
      notes:'Keep prototype lightweight; focus on workflow friction removal.',
    }
  ]

  return { items, meetings, recurring }
}
