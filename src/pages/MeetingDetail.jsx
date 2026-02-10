import React, { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useData } from '../state/store'
import ItemDrawer from '../components/ItemDrawer'
import { uid } from '../data/mock'

function toKey(dateISO, timeStr){
  // sortable numeric key YYYYMMDDHHMM
  const d = (dateISO || '').trim()
  if(!/^\d{4}-\d{2}-\d{2}$/.test(d)) return Number.POSITIVE_INFINITY

  let hh = 23, mm = 59
  const t = (timeStr || '').trim()
  if(/^\d{1,2}:\d{2}$/.test(t)){
    const [h, m] = t.split(':')
    hh = Math.max(0, Math.min(23, parseInt(h, 10) || 0))
    mm = Math.max(0, Math.min(59, parseInt(m, 10) || 0))
  }

  return parseInt(
    d.replaceAll('-', '') +
      String(hh).padStart(2, '0') +
      String(mm).padStart(2, '0'),
    10
  )
}

function textToChecklist(text){
  const lines = (text || '')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)

  return lines.map(line => ({
    id: uid('ag'),
    text: line,
    done: false
  }))
}

function checklistToText(items){
  return (items || [])
    .map(x => (x?.text || '').trim())
    .filter(Boolean)
    .join('\n')
}

function normalizeChecklist(maybeItems, maybeText){
  if(Array.isArray(maybeItems) && maybeItems.length){
    return maybeItems.map(x => ({
      id: x?.id || uid('ag'),
      text: x?.text || '',
      done: !!x?.done
    }))
  }
  if(typeof maybeText === 'string' && maybeText.trim()){
    return textToChecklist(maybeText)
  }
  return []
}

function ChecklistEditor({
  label,
  hint,
  items,
  onChange,
  addPlaceholder = 'Add an item…'
}){
  const [newText, setNewText] = useState('')

  const add = ()=>{
    const t = newText.trim()
    if(!t) return
    onChange([...(items || []), { id: uid('ag'), text: t, done: false }])
    setNewText('')
  }

  const toggle = (id)=>{
    onChange((items || []).map(x => x.id === id ? { ...x, done: !x.done } : x))
  }

  const edit = (id, text)=>{
    onChange((items || []).map(x => x.id === id ? { ...x, text } : x))
  }

  const remove = (id)=>{
    onChange((items || []).filter(x => x.id !== id))
  }

  return (
    <div className="field">
      <label>{label}</label>
      {hint ? <div className="small" style={{marginBottom:8}}>{hint}</div> : null}

      <div className="stack">
        {(items || []).map(x=>(
          <div
            key={x.id}
            style={{
              display:'flex',
              gap:10,
              alignItems:'center',
              padding:'8px 10px',
              border:'1px solid rgba(255,255,255,.08)',
              borderRadius:12,
              background:'rgba(0,0,0,.10)'
            }}
          >
            <input
              type="checkbox"
              checked={!!x.done}
              onChange={()=>toggle(x.id)}
              style={{transform:'scale(1.05)'}}
            />
            <input
              className="input"
              value={x.text}
              onChange={e=>edit(x.id, e.target.value)}
              style={{
                flex:1,
                opacity: x.done ? 0.6 : 1,
                textDecoration: x.done ? 'line-through' : 'none'
              }}
            />
            <button className="btn ghost" onClick={()=>remove(x.id)} title="Remove">
              ✕
            </button>
          </div>
        ))}

        {(items || []).length === 0 ? (
          <div className="small">No items yet.</div>
        ) : null}
      </div>

      <div style={{display:'flex', gap:8, marginTop:10}}>
        <input
          className="input"
          style={{flex:1}}
          value={newText}
          onChange={e=>setNewText(e.target.value)}
          placeholder={addPlaceholder}
          onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); add() } }}
        />
        <button className="btn primary" onClick={add}>Add</button>
      </div>
    </div>
  )
}

export default function MeetingDetail({ onQuickAddFromMeeting }){
  const { id } = useParams()
  const { state, upsertMeeting } = useData()
  const [selectedId, setSelectedId] = useState('')
  const [err, setErr] = useState('')

  const meeting = useMemo(
    ()=> state.meetings.find(m=>m.id===id) || null,
    [state.meetings, id]
  )

  const meetingItems = useMemo(
    ()=> state.items.filter(i=>i.meetingId===id),
    [state.items, id]
  )

  const nextMeeting = useMemo(()=>{
    if(!meeting) return null
    const baseKey = toKey(meeting.date, meeting.time)

    const candidates = state.meetings
      .filter(m => m.id !== meeting.id)
      .filter(m => {
        // Prefer templateId matching; fallback to title matching if no templateId
        if(meeting.templateId) return m.templateId === meeting.templateId
        return m.title === meeting.title
      })
      .filter(m => toKey(m.date, m.time) > baseKey)
      .slice()

    candidates.sort((a,b)=> toKey(a.date, a.time) - toKey(b.date, b.time))
    return candidates[0] || null
  }, [state.meetings, meeting])

  if(!meeting){
    return (
      <div className="card">
        <div className="card-h"><h3>Meeting not found</h3></div>
        <div className="card-b">
          <Link to="/meetings" style={{textDecoration:'underline'}}>Back to meetings</Link>
        </div>
      </div>
    )
  }

  const agendaItems = useMemo(
    ()=> normalizeChecklist(meeting.agendaItems, meeting.agenda),
    [meeting.agendaItems, meeting.agenda]
  )

  const nextAgendaItems = useMemo(
    ()=> normalizeChecklist(meeting.nextAgendaItems, meeting.nextAgenda),
    [meeting.nextAgendaItems, meeting.nextAgenda]
  )

  const set = (patch)=>{
    upsertMeeting({ ...meeting, ...patch })
  }

  const setAgendaItems = (items)=>{
    set({
      agendaItems: items,
      agenda: checklistToText(items), // keep string in sync for any other views
    })
  }

  const setNextAgendaItems = (items)=>{
    set({
      nextAgendaItems: items,
      nextAgenda: checklistToText(items), // keep string in sync for any other views
    })
  }

  const moveNextAgendaIntoNextMeeting = ()=>{
    setErr('')

    const toMove = (nextAgendaItems || [])
      .map(x => ({ ...x, text: (x.text || '').trim() }))
      .filter(x => x.text)

    if(toMove.length === 0) return

    if(!nextMeeting){
      setErr('No next meeting instance found yet for this recurring meeting.')
      return
    }

    // Append into NEXT meeting’s Agenda items (NOT its nextAgenda)
    const nextAgenda = normalizeChecklist(nextMeeting.agendaItems, nextMeeting.agenda)

    const appended = [
      ...nextAgenda,
      ...toMove.map(x => ({ id: uid('ag'), text: x.text, done: false }))
    ]

    upsertMeeting({
      ...nextMeeting,
      agendaItems: appended,
      agenda: checklistToText(appended),
      // nextAgendaItems / nextAgenda untouched on purpose
    })

    // Clear THIS meeting’s next-meeting list
    upsertMeeting({
      ...meeting,
      nextAgendaItems: [],
      nextAgenda: '',
    })
  }

  return (
    <div className="grid">
      <div className="stack">
        <div className="card">
          <div className="card-h">
            <h3>{meeting.title}</h3>
            <span className="meta">{meeting.date} • {meeting.time || '—'}</span>
          </div>

          <div className="card-b">
            <ChecklistEditor
              label="Agenda"
              items={agendaItems}
              onChange={setAgendaItems}
              addPlaceholder="Add an agenda item…"
            />

            <hr className="sep" />

            <div className="field">
              <label>Decisions</label>
              <textarea
                className="input"
                rows={3}
                value={meeting.decisions || ''}
                onChange={e=>set({ decisions: e.target.value })}
                placeholder="Decisions made…"
              />
            </div>

            <div className="field" style={{marginTop:10}}>
              <label>Actions</label>
              <textarea
                className="input"
                rows={3}
                value={meeting.actionsText || ''}
                onChange={e=>set({ actionsText: e.target.value })}
                placeholder="Actions (free text for now)…"
              />
            </div>

            <div className="field" style={{marginTop:10}}>
              <label>Notes</label>
              <textarea
                className="input"
                rows={3}
                value={meeting.notes || ''}
                onChange={e=>set({ notes: e.target.value })}
                placeholder="Notes…"
              />
            </div>

            <hr className="sep" />

            <ChecklistEditor
              label="Next meeting agenda"
              hint={
                nextMeeting
                  ? <>Adds directly into the agenda of: <b>{nextMeeting.date} {nextMeeting.time || ''}</b></>
                  : <>No next meeting instance detected yet.</>
              }
              items={nextAgendaItems}
              onChange={setNextAgendaItems}
              addPlaceholder="Add something for next time…"
            />

            <div style={{display:'flex', gap:8, marginTop:10, alignItems:'center', justifyContent:'space-between'}}>
              <div className="small" style={{color:'rgba(255,255,255,.65)'}}>
                {err ? <span style={{color:'#ff7b7b'}}>{err}</span> : null}
              </div>
              <button className="btn primary" onClick={moveNextAgendaIntoNextMeeting}>
                Add to next meeting agenda
              </button>
            </div>

            <hr className="sep" />

            <div style={{display:'flex', gap:8, alignItems:'center', justifyContent:'space-between'}}>
              <div className="small">Add actions/chasers/notes directly from this meeting.</div>
              <button className="btn primary" onClick={()=>onQuickAddFromMeeting?.(id)}>
                Quick add in meeting
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h3>Linked items</h3>
            <span className="meta">{meetingItems.length}</span>
          </div>
          <div className="card-b">
            <table className="table">
              <thead>
                <tr>
                  <th style={{width:92}}>Type</th>
                  <th>Title</th>
                  <th style={{width:110}}>Status</th>
                  <th style={{width:120}}>Next</th>
                </tr>
              </thead>
              <tbody>
                {meetingItems.map(i=>(
                  <tr key={i.id} className="rowlink" onClick={()=>setSelectedId(i.id)}>
                    <td><span className="pill">{i.type}</span></td>
                    <td>{i.title}</td>
                    <td><span className="pill">{i.status}</span></td>
                    <td>{i.nextActionDate || '—'}</td>
                  </tr>
                ))}
                {meetingItems.length===0 ? (
                  <tr><td colSpan="4" className="small">No linked items yet.</td></tr>
                ) : null}
              </tbody>
            </table>

            <div style={{marginTop:10}}>
              <Link to="/meetings" style={{textDecoration:'underline'}}>← Back to meetings</Link>
            </div>
          </div>
        </div>
      </div>

      <ItemDrawer selectedId={selectedId} onClose={()=>setSelectedId('')} />
    </div>
  )
}
