import React, { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useData } from '../state/store'
import ItemDrawer from '../components/ItemDrawer'

export default function MeetingDetail({ onQuickAddFromMeeting }){
  const { id } = useParams()
  const { state } = useData()
  const [selectedId, setSelectedId] = useState('')

  const meeting = useMemo(()=> state.meetings.find(m=>m.id===id) || null, [state.meetings, id])
  const meetingItems = useMemo(()=> state.items.filter(i=>i.meetingId===id), [state.items, id])

  if(!meeting){
    return (
      <div className="card">
        <div className="card-h"><h3>Meeting not found</h3></div>
        <div className="card-b"><Link to="/meetings" style={{textDecoration:'underline'}}>Back to meetings</Link></div>
      </div>
    )
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
              <div className="small" style={{whiteSpace:'pre-wrap'}}>{meeting.agenda || '—'}</div>
            </div>

            <hr className="sep" />

            <div style={{display:'flex', gap:8, alignItems:'center', justifyContent:'space-between'}}>
              <div className="small">Add actions/chasers/notes directly from this meeting.</div>
              <button className="btn primary" onClick={()=>onQuickAddFromMeeting(id)}>Quick add in meeting</button>
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
