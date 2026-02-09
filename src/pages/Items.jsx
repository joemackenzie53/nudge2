import React, { useMemo, useState } from 'react'
import { useData } from '../state/store'
import ItemDrawer from '../components/ItemDrawer'

export default function Items(){
  const { state } = useData()
  const [selectedId, setSelectedId] = useState('')
  const [q, setQ] = useState('')

  const rows = useMemo(()=>{
    const needle = q.trim().toLowerCase()
    const xs = state.items.slice()
    xs.sort((a,b)=> (a.nextActionDate||'9999-99-99').localeCompare(b.nextActionDate||'9999-99-99'))
    if(!needle) return xs
    return xs.filter(i=>
      (i.title||'').toLowerCase().includes(needle) ||
      (i.person||'').toLowerCase().includes(needle) ||
      (i.type||'').toLowerCase().includes(needle)
    )
  }, [state.items, q])

  return (
    <div className="grid">
      <div className="card">
        <div className="card-h">
          <h3>Items</h3>
          <span className="meta">{rows.length} total</span>
        </div>
        <div className="card-b">
          <div className="field" style={{marginBottom:10}}>
            <label>Search</label>
            <input className="input" value={q} onChange={e=>setQ(e.target.value)} placeholder="type to filter… (title, person, type)" />
          </div>

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
              {rows.map(i=>(
                <tr key={i.id} className="rowlink" onClick={()=>setSelectedId(i.id)}>
                  <td><span className="pill">{i.type}</span></td>
                  <td>{i.title}</td>
                  <td>{i.nextActionDate || '—'}</td>
                  <td><span className="pill">{i.status}</span></td>
                </tr>
              ))}
              {rows.length===0 ? (
                <tr><td colSpan="4" className="small">No matches.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <ItemDrawer selectedId={selectedId} onClose={()=>setSelectedId('')} />
    </div>
  )
}
