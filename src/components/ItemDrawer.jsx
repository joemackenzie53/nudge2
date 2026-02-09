import React, { useMemo, useState } from 'react'
import { ENERGIES, STATUSES, TYPES, useData } from '../state/store'

function fmtDate(ts){
  try{
    const d = new Date(ts)
    return d.toLocaleString()
  }catch{
    return ''
  }
}

export default function ItemDrawer({ selectedId, onClose }){
  const { state, updateItem, addLog, snooze, convertType } = useData()
  const item = useMemo(()=> state.items.find(i=>i.id===selectedId) || null, [state.items, selectedId])
  const [logText, setLogText] = useState('')

  if(!item){
    return (
      <div className="card drawer">
        <div className="card-h">
          <h3>Details</h3>
          <span className="meta">Select an item</span>
        </div>
        <div className="card-b">
          <div className="small">Pick a row to view/edit fields and history.</div>
        </div>
      </div>
    )
  }

  const set = (patch)=> updateItem({ ...item, ...patch })
  const typeLabel = TYPES.find(t=>t.value===item.type)?.label || item.type

  return (
    <div className="card drawer">
      <div className="card-h">
        <h3>{typeLabel}</h3>
        <button className="btn ghost" onClick={onClose}>Close</button>
      </div>

      <div className="card-b">
        {/* Title stays for all item types */}
        <div className="field">
          <label>Title</label>
          <input className="input" value={item.title || ''} onChange={e=>set({ title:e.target.value })} />
        </div>

        {/* CHASE */}
        {item.type === 'chase' && (
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:10}}>
            <div className="field">
              <label>Who</label>
              <input
                className="input"
                value={item.who || ''}
                onChange={e=>set({ who:e.target.value })}
                placeholder="e.g., Legal / John Smith"
              />
            </div>
            <div className="field">
              <label>Where</label>
              <input
                className="input"
                value={item.where || ''}
                onChange={e=>set({ where:e.target.value })}
                placeholder="e.g., Slack / Email / Jira / Ticket #"
              />
            </div>
            <div className="field">
              <label>Status</label>
              <select className="input" value={item.status || 'open'} onChange={e=>set({ status:e.target.value })}>
                {STATUSES.map(s=> <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Next action date</label>
              <input
                className="input"
                type="date"
                value={item.nextActionDate || ''}
                onChange={e=>set({ nextActionDate:e.target.value })}
              />
            </div>
          </div>
        )}

        {/* TASK */}
        {item.type === 'task' && (
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:10}}>
            <div className="field">
              <label>Area</label>
              <input
                className="input"
                value={item.area || ''}
                onChange={e=>set({ area:e.target.value })}
                placeholder="e.g., Admin / Product / Payments"
              />
            </div>

            <div className="field">
              <label>Energy</label>
              <select className="input" value={item.energy || ''} onChange={e=>set({ energy:e.target.value })}>
                <option value="">—</option>
                {ENERGIES.map(s=> <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div className="field">
              <label>Next action date</label>
              <input
                className="input"
                type="date"
                value={item.nextActionDate || ''}
                onChange={e=>set({ nextActionDate:e.target.value })}
              />
            </div>

            <div className="field">
              <label>Due / target</label>
              <input
                className="input"
                type="date"
                value={item.dueDate || ''}
                onChange={e=>set({ dueDate:e.target.value })}
              />
            </div>

            <div className="field" style={{gridColumn:'1 / -1'}}>
              <label>Notes / next steps</label>
              <textarea
                className="input"
                rows={4}
                value={item.notes || ''}
                onChange={e=>set({ notes:e.target.value })}
                placeholder="What’s the next step? Any context/links?"
              />
            </div>
          </div>
        )}

        {/* UNTRIAGED (keep light; mostly just title + meetingId if present) */}
        {item.type === 'untriaged' && (
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:10}}>
            <div className="field">
              <label>Status</label>
              <select className="input" value={item.status || 'open'} onChange={e=>set({ status:e.target.value })}>
                {STATUSES.map(s=> <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Next action date</label>
              <input
                className="input"
                type="date"
                value={item.nextActionDate || ''}
                onChange={e=>set({ nextActionDate:e.target.value })}
              />
            </div>
          </div>
        )}

        <hr className="sep" />

        {/* Actions */}
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          <button className="btn" onClick={()=>snooze(item.id, 1)}>Snooze 1d</button>
          <button className="btn" onClick={()=>snooze(item.id, 3)}>Snooze 3d</button>
          <button className="btn" onClick={()=>snooze(item.id, 7)}>Snooze 7d</button>

          {item.type==='untriaged' && (
            <>
              <button className="btn primary" onClick={()=>convertType({ itemId:item.id, toType:'task' })}>Convert to Task</button>
              <button className="btn primary" onClick={()=>convertType({ itemId:item.id, toType:'chase' })}>Convert to Chase</button>
            </>
          )}

          {item.type==='task' && (
            <>
              <button className="btn" onClick={()=>convertType({ itemId:item.id, toType:'chase' })}>Convert to Chase</button>
              <button className="btn" onClick={()=>convertType({ itemId:item.id, toType:'untriaged' })}>Convert to Untriaged</button>
            </>
          )}

          {item.type==='chase' && (
            <>
              <button className="btn" onClick={()=>convertType({ itemId:item.id, toType:'task' })}>Convert to Task</button>
              <button className="btn" onClick={()=>convertType({ itemId:item.id, toType:'untriaged' })}>Convert to Untriaged</button>
            </>
          )}

          {(!['untriaged','task','chase'].includes(item.type)) && (
            <button className="btn" onClick={()=>convertType({ itemId:item.id, toType:'untriaged' })}>Convert to Untriaged</button>
          )}
        </div>

        <hr className="sep" />

        {/* Log */}
        <div className="field">
          <label>Add log entry</label>
          <div style={{display:'flex', gap:8}}>
            <input
              className="input"
              style={{flex:1}}
              value={logText}
              onChange={e=>setLogText(e.target.value)}
              placeholder="e.g., Chased on Slack; waiting for reply"
            />
            <button className="btn primary" onClick={()=>{
              const t = logText.trim()
              if(!t) return
              addLog({ itemId:item.id, text:t })
              setLogText('')
            }}>Add</button>
          </div>
        </div>

        <div style={{marginTop:12}}>
          <div className="small" style={{marginBottom:6}}>History</div>
          <div className="stack">
            {(item.log||[]).slice(0,12).map(l=>(
              <div key={l.id} style={{border:'1px solid rgba(255,255,255,.08)', borderRadius:12, padding:'8px 10px', background:'rgba(0,0,0,.10)'}}>
                <div style={{fontSize:13}}>{l.text}</div>
                <div className="small">{fmtDate(l.ts)}</div>
              </div>
            ))}
            {(!item.log || item.log.length===0) ? <div className="small">No log entries.</div> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
