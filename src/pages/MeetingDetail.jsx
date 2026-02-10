import React, { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useData } from '../state/store'
import ItemDrawer from '../components/ItemDrawer'

export default function MeetingDetail({ onQuickAddFromMeeting }){
  const { id } = useParams()
  const {
    state,
    updateMeeting,
    addMeetingAgendaItem,
    toggleMeetingAgendaDone,
    updateMeetingAgendaText,
    removeMeetingAgendaItem,
    addTemplateNextAgendaItem,
    updateTemplateNextAgendaText,
    removeTemplateNextAgendaItem,
    upsertTemplate,
  } = useData()

  const [selectedId, setSelectedId] = useState('')
  const [agendaInput, setAgendaInput] = useState('')
  const [nextAgendaInput, setNextAgendaInput] = useState('')

  const meeting = useMemo(()=> (state.meetings || []).find(m=>m.id===id) || null, [state.meetings, id])
  const meetingItems = useMemo(()=> (state.items || []).filter(i=>i.meetingId===id), [state.items, id])

  const template = useMemo(()=>{
    if(!meeting?.templateId) return null
    return (state.recurring || []).find(t=>t.id===meeting.templateId) || null
  }, [state.recurring, meeting?.templateId])

  if(!meeting){
    return (
      <div className="card">
        <div className="card-h"><h3>Meeting not found</h3></div>
        <div className="card-b"><Link to="/meetings" style={{textDecoration:'underline'}}>Back to meetings</Link></div>
      </div>
    )
  }

  const agenda = meeting.agendaItems || []

  return (
    <div className="grid">
      <div className="stack">
        {/* Header / core fields */}
        <div className="card">
          <div className="card-h" style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:10}}>
            <div>
              <h3 style={{margin:0}}>Meeting</h3>
              <span className="meta">
                {meeting.templateId ? (
                  <>Recurring • <Link to={`/recurring/${meeting.templateId}`} style={{textDecoration:'underline'}}>Template</Link></>
                ) : 'One-off'}
              </span>
            </div>
            <Link to="/meetings" className="btn ghost">Back</Link>
          </div>

          <div className="card-b">
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
              <div className="field" style={{gridColumn:'1 / -1'}}>
                <label>Meeting name</label>
                <input
                  className="input"
                  value={meeting.title || ''}
                  onChange={e=>updateMeeting({ ...meeting, title:e.target.value })}
                />
              </div>

              <div className="field">
                <label>Date</label>
                <input
                  className="input"
                  type="date"
                  value={meeting.date || ''}
                  onChange={e=>updateMeeting({ ...meeting, date:e.target.value })}
                />
              </div>

              <div className="field">
                <label>Time</label>
                <input
                  className="input"
                  value={meeting.time || ''}
                  onChange={e=>updateMeeting({ ...meeting, time:e.target.value })}
                  placeholder="HH:MM"
                />
              </div>
            </div>

            <hr className="sep" />

            {/* Agenda (meeting instance) */}
            <div className="field">
              <label>Agenda</label>

              <div className="stack" style={{marginTop:8}}>
                {agenda.map(a=>(
                  <div key={a.id} style={{display:'flex', gap:10, alignItems:'flex-start'}}>
                    <input
                      type="checkbox"
                      checked={!!a.done}
                      onChange={()=>toggleMeetingAgendaDone({ meetingId:meeting.id, agendaId:a.id })}
                      style={{marginTop:6}}
                    />
                    <input
                      className="input"
                      value={a.text || ''}
                      onChange={e=>updateMeetingAgendaText({ meetingId:meeting.id, agendaId:a.id, text:e.target.value })}
                    />
                    <button className="btn ghost" onClick={()=>removeMeetingAgendaItem({ meetingId:meeting.id, agendaId:a.id })}>
                      Remove
                    </button>
                  </div>
                ))}

                {agenda.length===0 ? <div className="small">No agenda items yet.</div> : null}
              </div>

              <div style={{display:'flex', gap:8, marginTop:10}}>
                <input
                  className="input"
                  style={{flex:1}}
                  value={agendaInput}
                  onChange={e=>setAgendaInput(e.target.value)}
                  placeholder="Add agenda item…"
                />
                <button
                  className="btn primary"
                  onClick={()=>{
                    const t = agendaInput.trim()
                    if(!t) return
                    addMeetingAgendaItem({ meetingId:meeting.id, text:t })
                    setAgendaInput('')
                  }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Next meeting agenda (template) */}
            {template ? (
              <>
                <hr className="sep" />

                <div className="field">
                  <label>Next meeting agenda (recurring template)</label>
                  <div className="small">Use this to add topics for the next occurrence of this recurring meeting.</div>

                  <div className="stack" style={{marginTop:8}}>
                    {(template.nextAgenda || []).map(a=>(
                      <div key={a.id} style={{display:'flex', gap:10, alignItems:'flex-start'}}>
                        <input
                          className="input"
                          value={a.text || ''}
                          onChange={e=>updateTemplateNextAgendaText({ templateId:template.id, agendaId:a.id, text:e.target.value })}
                        />
                        <button className="btn ghost" onClick={()=>removeTemplateNextAgendaItem({ templateId:template.id, agendaId:a.id })}>
                          Remove
                        </button>
                      </div>
                    ))}
                    {(template.nextAgenda || []).length===0 ? <div className="small">No “next meeting” agenda items yet.</div> : null}
                  </div>

                  <div style={{display:'flex', gap:8, marginTop:10}}>
                    <input
                      className="input"
                      style={{flex:1}}
                      value={nextAgendaInput}
                      onChange={e=>setNextAgendaInput(e.target.value)}
                      placeholder="Add next meeting agenda item…"
                    />
                    <button
                      className="btn"
                      onClick={()=>{
                        const t = nextAgendaInput.trim()
                        if(!t) return
                        addTemplateNextAgendaItem({ templateId:template.id, text:t })
                        setNextAgendaInput('')
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </>
            ) : null}

            <hr className="sep" />

            {/* Notes / decisions / actions */}
            <div style={{display:'grid', gridTemplateColumns:'1fr', gap:10}}>
              <div className="field">
                <label>Decisions</label>
                <textarea
                  className="input"
                  rows={3}
                  value={meeting.decisions || ''}
                  onChange={e=>updateMeeting({ ...meeting, decisions:e.target.value })}
                  placeholder="What was decided?"
                />
              </div>

              <div className="field">
                <label>Actions</label>
                <textarea
                  className="input"
                  rows={3}
                  value={meeting.actions || ''}
                  onChange={e=>updateMeeting({ ...meeting, actions:e.target.value })}
                  placeholder="Action items (free text for now)"
                />
              </div>

              <div className="field">
                <label>Notes</label>
                <textarea
                  className="input"
                  rows={4}
                  value={meeting.notes || ''}
                  onChange={e=>updateMeeting({ ...meeting, notes:e.target.value })}
                  placeholder="Any notes / context"
                />
              </div>
            </div>

            <hr className="sep" />

            <div style={{display:'flex', gap:8, alignItems:'center', justifyContent:'space-between'}}>
              <div className="small">Add actions/chasers/notes directly from this meeting.</div>
              <button className="btn primary" onClick={()=>onQuickAddFromMeeting(meeting.id)}>Quick add in meeting</button>
            </div>
          </div>
        </div>

        {/* Linked items */}
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
