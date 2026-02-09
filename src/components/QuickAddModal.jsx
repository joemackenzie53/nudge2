import React, { useMemo, useState } from 'react'
import { useData, TYPES } from '../state/store'

export default function QuickAddModal({ open, onClose, meetingId='' }){
  const { createQuickNote, createItem } = useData()
  const [mode, setMode] = useState('note') // note | task | chase
  const [title, setTitle] = useState('')

  const type = useMemo(()=> mode==='note' ? 'untriaged' : (mode==='task' ? 'task' : 'chase'), [mode])

  if(!open) return null

  const submit = ()=>{
    const t = title.trim()
    if(!t) return
    if(mode==='note'){
      createQuickNote({ title:t, meetingId })
    }else{
      createItem({ type, title:t, meetingId })
    }
    setTitle('')
    onClose()
  }

  return (
    <div className="modalOverlay" onMouseDown={(e)=>{ if(e.target===e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-h">
          <h3>Quick add</h3>
          <button className="btn ghost" onClick={onClose}>Close</button>
        </div>
        <div className="modal-b">
          <div style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom:10}}>
            <button className={`btn ${mode==='note'?'primary':''}`} onClick={()=>setMode('note')}>Note</button>
            <button className={`btn ${mode==='task'?'primary':''}`} onClick={()=>setMode('task')}>Task</button>
            <button className={`btn ${mode==='chase'?'primary':''}`} onClick={()=>setMode('chase')}>Chase</button>
            <span className="pill" style={{marginLeft:'auto'}}>Creates: {TYPES.find(x=>x.value===type)?.label}</span>
          </div>

          <div className="field">
            <label>Title</label>
            <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g., Follow up with ops on payout file" />
          </div>

          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:12}}>
            <div className="small">Tip: create quick notes during meetings, triage later.</div>
            <button className="btn primary" onClick={submit}>Add</button>
          </div>
        </div>
      </div>
    </div>
  )
}
