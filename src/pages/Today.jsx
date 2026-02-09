import React, { useMemo, useState } from 'react'
import { useData } from '../state/store'
import ItemDrawer from '../components/ItemDrawer'

function sameDay(a,b){ return (a||'') === (b||'') }
function meetingTitle(m){ return m?.title || m?.name || m?.meeting || 'Meeting' }

export default function Today(){
  const { state } = useData()
  const [selectedId, setSelectedId] = useState('')

  const today = useMemo(()=>{
    const d = new Date()
    d.setHours(0,0,0,0)
    return d.toISOString().slice(0,10)
  }, [])

  const due = useMemo(()=>{
    const out = []
    for(const i of state.items){
      if(i.status==='done') continue
      if(sameDay(i.nextActionDate, today)) out.push(i)
    }
    return out
  }, [state.items, today])

  const todaysMeetings = useMemo(()=>{
    return (state.meetings || []).filter(m => sameDay(m.date, today))
  }, [state.meetings, today])

  return (
    <div className="grid">
      <div className="stack">
        <div className="card">
          <div className="card-h">
            <h3>Today</h3>
            <span className="meta">{today}</span>
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
                {due.map(i=>(
                  <tr key={i.id} className="rowlink" onClick={()=>setSelectedId(i.id)}>
                    <td><span className="pill accent">{i.type}</span></td>
                    <td>{i.title}</td>
                    <td><span className="pill">{i.status}</span></td>
                    <td>{i.nextActionDate || '—'}</td>
                  </tr>
                ))}
                {due.length===0 ? (
                  <tr><td colSpan="4" className="small">Nothing scheduled for today. Check Inbox for triage.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-h" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h3 style={{margin:0}}>Today’s meetings</h3>
            <span className="meta">{todaysMeetings.length} total</span>
          </div>
          <div className="card-b">
            {todaysMeetings.length===0 ? (
              <div className="small">No meetings today.</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th style={{width:120}}>Time</th>
                    <th>Meeting</th>
                    <th style={{width:90}}>Items</th>
                  </tr>
                </thead>
                <tbody>
                  {todaysMeetings.map(m=>(
                    <tr key={m.id}>
                      <td>{m.time || '—'}</td>
                      <td style={{fontWeight:600}}>
                        <a href={`#/meetings/${m.id}`} style={{textDecoration:'underline'}}>
                          {meetingTitle(m)}
                        </a>
                      </td>
                      <td><span className="pill">{(m.itemIds || []).length}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <ItemDrawer selectedId={selectedId} onClose={()=>setSelectedId('')} />
    </div>
  )
}
