import React, { useMemo, useState } from 'react'
import { useData } from '../state/store'
import ItemDrawer from '../components/ItemDrawer'

export default function Inbox(){
  const { state } = useData()
  const [selectedId, setSelectedId] = useState('')

  const { untriaged, needsAttention } = useMemo(()=>{
    const untriaged = state.items.filter(i=> i.status!=='done' && i.type==='untriaged')
    const needsAttention = state.items.filter(i=> i.status!=='done' && i.type!=='untriaged').slice()
    needsAttention.sort((a,b)=> (a.nextActionDate||'9999-99-99').localeCompare(b.nextActionDate||'9999-99-99'))
    return { untriaged, needsAttention }
  }, [state.items])

  return (
    <div className="grid">
      <div className="stack">
        <div className="card">
          <div className="card-h">
            <h3>Triage</h3>
            <span className="meta">quick notes → task / chase</span>
          </div>
          <div className="card-b">
            <table className="table">
              <thead>
                <tr>
                  <th style={{width:110}}>Kind</th>
                  <th>Title</th>
                  <th style={{width:120}}>Meeting</th>
                </tr>
              </thead>
              <tbody>
                {untriaged.map(i=>(
                  <tr key={i.id} className="rowlink" onClick={()=>setSelectedId(i.id)}>
                    <td><span className="pill warn">untriaged</span></td>
                    <td>{i.title}</td>
                    <td className="small">{i.meetingId || '—'}</td>
                  </tr>
                ))}
                {untriaged.length===0 ? (
                  <tr><td colSpan="3" className="small">No untriaged notes. Use “Quick add” to capture one.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h3>All open items</h3>
            <span className="meta">for scanning + decisions</span>
          </div>
          <div className="card-b">
            <table className="table">
              <thead>
                <tr>
                  <th style={{width:92}}>Type</th>
                  <th>Title</th>
                  <th style={{width:120}}>Next</th>
                  <th style={{width:110}}>Status</th>
                </tr>
              </thead>
              <tbody>
                {needsAttention.slice(0,12).map(i=>(
                  <tr key={i.id} className="rowlink" onClick={()=>setSelectedId(i.id)}>
                    <td><span className="pill">{i.type}</span></td>
                    <td>{i.title}</td>
                    <td>{i.nextActionDate || '—'}</td>
                    <td><span className="pill">{i.status}</span></td>
                  </tr>
                ))}
                {needsAttention.length===0 ? (
                  <tr><td colSpan="4" className="small">No open tasks/chases yet.</td></tr>
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
