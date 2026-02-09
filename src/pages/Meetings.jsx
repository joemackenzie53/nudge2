import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../state/store'

export default function Meetings(){
  const { state } = useData()

  const meetings = useMemo(()=>{
    const xs = state.meetings.slice()
    xs.sort((a,b)=> (b.date||'').localeCompare(a.date||''))
    return xs
  }, [state.meetings])

  return (
    <div className="card">
      <div className="card-h">
        <h3>Meetings</h3>
        <span className="meta">{meetings.length} total</span>
      </div>
      <div className="card-b">
        <table className="table">
          <thead>
            <tr>
              <th style={{width:110}}>Date</th>
              <th style={{width:90}}>Time</th>
              <th>Meeting</th>
              <th style={{width:110}}>Items</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map(m=>{
              const count = state.items.filter(i=>i.meetingId===m.id).length
              return (
                <tr key={m.id} className="rowlink">
                  <td>{m.date}</td>
                  <td>{m.time || '—'}</td>
                  <td>
                    <Link to={`/meetings/${m.id}`} style={{textDecoration:'underline'}}>
                      {m.title}
                    </Link>
                  </td>
                  <td><span className="pill">{count}</span></td>
                </tr>
              )
            })}
            {meetings.length===0 ? (
              <tr><td colSpan="4" className="small">No meetings yet.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
