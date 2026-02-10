import React, { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useData } from '../state/store'
import ItemDrawer from '../components/ItemDrawer'

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

function appendAgenda(existing, addition){
  const a = (existing || '').trim()
  const b = (addition || '').trim()
  if(!b) return a
  if(!a) return b
  return `${a}\n${b}`
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

  const set = (patch)=>{
    upsertMeeting({ ...meeting, ...patch })
  }

  const moveNextAgendaIntoNextMeeting = ()=>{
    setErr('')
    const text = (meeting.nextAgenda || '').trim()
    if(!text) return

    if(!nextMeeting){
      setErr('No next meeting instance found yet for this recurring meeting.')
      return
    }

    // ✅ Critical fix: write into *next meeting’s agenda*, NOT its nextAgenda.
    const updatedNext = {
      ...nextMeeting,
      agenda: appendAgenda(nextMeeting.agenda, text),
      // leave nextMeeting.nextAgenda untouched (so it stays empty unless user adds it there)
    }

    // Clear *this meeting’s* nextAgenda after transferring
    const updatedThis = { ...meeting, nextAgenda: '' }

    upsertMeeting(updatedNext)
    upsertMeeting(updatedThis)
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
            <div className="field">
              <label>Agenda</label>
              <textarea
                className="input"
                rows={6}
                value={meeting.agenda || ''}
                onChange={e=>set({ agenda: e.target.value })}
                placeholder="Agenda items…"
              />
            </div>

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

            <div className="field">
              <label>Next meeting agenda</label>
              <div className="small" style={{marginBottom:6}}>
                {nextMeeting
                  ? <>Adds directly into the agenda of: <b>{nextMeeting.date} {nextMeeting.time || ''}</b></>
                  : <>No next meeting instance detected yet.</>
                }
              </div>

              <textarea
                className="input"
                rows={3}
                value={meeting.nextAgenda || ''}
                onChange={e=>set({ nextAgenda: e.target.value })}
                placeholder="Things to discuss next time…"
              />

              <div style={{display:'flex', gap:8, marginTop:10, alignItems:'center', justifyContent:'space-between'}}>
                <div className="small" style={{color:'rgba(255,255,255,.65)'}}>
                  {err ? <span style={{color:'#ff7b7b'}}>{err}</span> : null}
                </div>
                <button className="btn primary" onClick={moveNextAgendaIntoNextMeeting}>
                  Add to next meeting agenda
                </button>
              </div>
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
