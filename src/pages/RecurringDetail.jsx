import React, { useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useData } from '../state/store'

const DOW = [
  { k:0, label:'Sun' },
  { k:1, label:'Mon' },
  { k:2, label:'Tue' },
  { k:3, label:'Wed' },
  { k:4, label:'Thu' },
  { k:5, label:'Fri' },
  { k:6, label:'Sat' },
]

export default function RecurringDetail(){
  const { id } = useParams()
  const nav = useNavigate()
  const {
    state,
    updateTemplate,
    deleteTemplate,
    addTemplateNextAgendaItem,
    updateTemplateNextAgendaText,
    removeTemplateNextAgendaItem,
  } = useData()

  const [newAgenda, setNewAgenda] = useState('')

  const t = useMemo(()=> (state.recurring || []).find(x=>x.id===id) || null, [state.recurring, id])

  if(!t){
    return (
      <div className="card">
        <div className="card-h"><h3>Template not found</h3></div>
        <div className="card-b"><Link to="/recurring" style={{textDecoration:'underline'}}>Back to templates</Link></div>
      </div>
    )
  }

  const toggleDow = (k)=>{
    const set = new Set(t.daysOfWeek || [])
    if(set.has(k)) set.delete(k); else set.add(k)
    updateTemplate({ ...t, daysOfWeek: Array.from(set).sort((a,b)=>a-b) })
  }

  const showDow = t.cadence === 'weekly' || t.cadence === 'custom'

  return (
    <div className="card">
      <div className="card-h" style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12}}>
        <div>
          <h3 style={{margin:0}}>Recurring template</h3>
          <span className="meta">Defines the recurring meeting + next-meeting agenda</span>
        </div>
        <div style={{display:'flex', gap:8}}>
          <Link className="btn ghost" to="/recurring">Back</Link>
          <button className="btn" onClick={()=>{
            deleteTemplate(t.id)
            nav('/recurring')
          }}>Delete</button>
        </div>
      </div>

      <div className="card-b">
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
          <div className="field" style={{gridColumn:'1 / -1'}}>
            <label>Meeting name</label>
            <input className="input" value={t.title || ''} onChange={e=>updateTemplate({ ...t, title:e.target.value })} />
          </div>

          <div className="field">
            <label>Time</label>
            <input className="input" value={t.time || ''} onChange={e=>updateTemplate({ ...t, time:e.target.value })} placeholder="HH:MM" />
          </div>

          <div className="field">
            <label>Cadence</label>
            <select className="input" value={t.cadence || 'weekly'} onChange={e=>updateTemplate({ ...t, cadence:e.target.value })}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="fortnightly">Fortnightly</option>
              <option value="custom">Custom days</option>
            </select>
          </div>

          {showDow ? (
            <div className="field" style={{gridColumn:'1 / -1'}}>
              <label>Days of week</label>
              <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                {DOW.map(d=>(
                  <button
                    key={d.k}
                    className={`btn ${ (t.daysOfWeek||[]).includes(d.k) ? 'primary' : '' }`}
                    onClick={()=>toggleDow(d.k)}
                    type="button"
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <div className="small" style={{marginTop:6}}>For weekly/custom cadences, select which days this meeting occurs on.</div>
            </div>
          ) : null}
        </div>

        <hr className="sep" />

        <div className="field">
          <label>Next meeting agenda</label>
          <div className="small">This feeds the agenda of the next generated meeting instance.</div>

          <div className="stack" style={{marginTop:8}}>
            {(t.nextAgenda || []).map(a=>(
              <div key={a.id} style={{display:'flex', gap:10, alignItems:'flex-start'}}>
                <input
                  className="input"
                  value={a.text || ''}
                  onChange={e=>updateTemplateNextAgendaText({ templateId:t.id, agendaId:a.id, text:e.target.value })}
                />
                <button className="btn ghost" onClick={()=>removeTemplateNextAgendaItem({ templateId:t.id, agendaId:a.id })}>
                  Remove
                </button>
              </div>
            ))}
            {(t.nextAgenda || []).length===0 ? <div className="small">No next-meeting agenda items yet.</div> : null}
          </div>

          <div style={{display:'flex', gap:8, marginTop:10}}>
            <input className="input" style={{flex:1}} value={newAgenda} onChange={e=>setNewAgenda(e.target.value)} placeholder="Add an agenda item…" />
            <button className="btn primary" onClick={()=>{
              const x = newAgenda.trim()
              if(!x) return
              addTemplateNextAgendaItem({ templateId:t.id, text:x })
              setNewAgenda('')
            }}>
              Add
            </button>
          </div>
        </div>

        <hr className="sep" />

        <div className="small">
          Meetings will be generated automatically from templates (so Today can show today’s meetings).
        </div>
      </div>
    </div>
  )
}
