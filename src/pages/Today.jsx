import React, { useMemo, useState } from 'react'
import { useData } from '../state/store'
import ItemDrawer from '../components/ItemDrawer'

function sameDay(a,b){ return (a||'') === (b||'') }

export default function Today(){
  const { state } = useData()
  const [selectedId, setSelectedId] = useState('')

  const today = useMemo(()=>{
    const d = new Date()
    d.setHours(0,0,0,0)
    return d.toISOString().slice(0,10)
  }, [])

  const { due, upcoming } = useMemo(()=>{
    const due = []
    const upcoming = []
    for(const i of state.items){
      if(i.status==='done') continue
      if(sameDay(i.nextActionDate, today)) due.push(i)
      else if(i.nextActionDate) upcoming.push(i)
    }
    upcoming.sort((a,b)=> (a.nextActionDate||'').localeCompare(b.nextActionDate||''))
    return { due, upcoming }
  }, [state.items, today])

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
          <div className="card-h">
            <h3>Upcoming</h3>
            <span className="meta">next action dates</span>
          </div>
          <div className="card-b">
            <table className="table">
              <thead>
                <tr>
                  <th style={{width:92}}>Type</th>
                  <th>Title</th>
                  <th style={{width:120}}>Next</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.slice(0,10).map(i=>(
                  <tr key={i.id} className="rowlink" onClick={()=>setSelectedId(i.id)}>
                    <td><span className="pill">{i.type}</span></td>
                    <td>{i.title}</td>
                    <td>{i.nextActionDate}</td>
                  </tr>
                ))}
                {upcoming.length===0 ? (
                  <tr><td colSpan="3" className="small">No upcoming items with dates yet.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ItemDrawer selectedId={selectedId} onClose={()=>setSelectedId('')} />
    </div>
  )
}
