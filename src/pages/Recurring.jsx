import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useData } from '../state/store'

function fmtCadence(t){
  if(!t) return '—'
  if(t.cadence === 'daily') return 'Daily'
  if(t.cadence === 'fortnightly') return 'Fortnightly'
  if(t.cadence === 'weekly') return `Weekly (${(t.daysOfWeek||[]).join(', ') || '—'})`
  if(t.cadence === 'custom') return `Custom (${(t.daysOfWeek||[]).join(', ') || '—'})`
  return t.cadence
}

export default function Recurring(){
  const { state, createTemplate } = useData()
  const nav = useNavigate()

  const templates = useMemo(()=>{
    const xs = (state.recurring || []).slice()
    xs.sort((a,b)=> (a.title||'').localeCompare(b.title||''))
    return xs
  }, [state.recurring])

  return (
    <div className="card">
      <div className="card-h" style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12}}>
        <div>
          <h3 style={{margin:0}}>Recurring meeting templates</h3>
          <span className="meta">{templates.length} total</span>
        </div>

        <button
          className="btn primary"
          onClick={()=>{
            const t = createTemplate()
            nav(`/recurring/${t.id}`)
          }}
        >
          New template
        </button>
      </div>

      <div className="card-b">
        <table className="table">
          <thead>
            <tr>
              <th>Meeting</th>
              <th style={{width:110}}>Time</th>
              <th style={{width:220}}>Cadence</th>
              <th style={{width:110}}>Edit</th>
            </tr>
          </thead>
          <tbody>
            {templates.map(t=>(
              <tr key={t.id} className="rowlink">
                <td style={{fontWeight:600}}>{t.title || 'Untitled'}</td>
                <td>{t.time || '—'}</td>
                <td className="small">{fmtCadence(t)}</td>
                <td>
                  <Link className="btn ghost" to={`/recurring/${t.id}`}>Open</Link>
                </td>
              </tr>
            ))}
            {templates.length===0 ? (
              <tr><td colSpan="4" className="small">No recurring templates yet.</td></tr>
            ) : null}
          </tbody>
        </table>

        <div style={{marginTop:10}}>
          <Link to="/meetings" style={{textDecoration:'underline'}}>← Back to meetings</Link>
        </div>
      </div>
    </div>
  )
}
