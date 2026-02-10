import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../state/store'

function getTodayISO(){
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDaysISO(iso, days){
  const [y, m, d] = (iso || '1970-01-01').split('-').map(Number)
  const dt = new Date(Date.UTC(y, (m || 1) - 1, d || 1))
  dt.setUTCDate(dt.getUTCDate() + days)
  return dt.toISOString().slice(0, 10)
}

function toComparableNumber(dateISO, timeStr){
  // numeric sortable key: YYYYMMDDHHMM
  const d = (dateISO || '').trim()
  if(!/^\d{4}-\d{2}-\d{2}$/.test(d)) return Number.POSITIVE_INFINITY

  let hh = 23, mm = 59 // default: end-of-day if missing/invalid time
  const t = (timeStr || '').trim()
  if(/^\d{1,2}:\d{2}$/.test(t)){
    const [h, m] = t.split(':')
    hh = Math.max(0, Math.min(23, parseInt(h, 10) || 0))
    mm = Math.max(0, Math.min(59, parseInt(m, 10) || 0))
  }

  return parseInt(
    d.replaceAll('-', '') +
      String(hh).padStart(2, '0') +
      String(mm).padStart(2, '0'),
    10
  )
}

export default function Meetings(){
  const data = useData()
  const state = data?.state || { meetings: [], items: [] }
  const createMeeting = data?.createMeeting // may or may not exist in your store yet

  const [showPast, setShowPast] = useState(false)
  const [showAllFuture, setShowAllFuture] = useState(false)

  const todayISO = useMemo(()=>getTodayISO(), [])
  const windowEndISO = useMemo(()=>addDaysISO(todayISO, 14), [todayISO])

  const now = useMemo(()=>{
    const n = new Date()
    const hh = String(n.getHours()).padStart(2,'0')
    const mm = String(n.getMinutes()).padStart(2,'0')
    return { iso: todayISO, time: `${hh}:${mm}` }
  }, [todayISO])

  const { upcoming14, futureBeyond14, past } = useMemo(()=>{
    const all = (state.meetings || []).slice()

    const keyNow = toComparableNumber(now.iso, now.time)
    const keyEnd = toComparableNumber(windowEndISO, '23:59')

    const upcoming14 = []
    const futureBeyond14 = []
    const past = []

    for(const m of all){
      const k = toComparableNumber(m.date, m.time)
      if(k < keyNow) past.push(m)
      else if(k <= keyEnd) upcoming14.push(m)
      else futureBeyond14.push(m)
    }

    const sorter = (a,b)=> toComparableNumber(a.date, a.time) - toComparableNumber(b.date, b.time)
    upcoming14.sort(sorter)
    futureBeyond14.sort(sorter)
    past.sort(sorter)

    return { upcoming14, futureBeyond14, past }
  }, [state.meetings, now.iso, now.time, windowEndISO])

  const visibleFuture = showAllFuture ? [...upcoming14, ...futureBeyond14] : upcoming14
  const visible = showPast ? [...visibleFuture, ...past] : visibleFuture

  const totalUpcomingShown = visibleFuture.length
  const hiddenFutureCount = futureBeyond14.length
  const hiddenPastCount = past.length

  return (
    <div className="card">
      <div
        className="card-h"
        style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}
      >
        <div>
          <h3>Meetings</h3>
          <span className="meta">
            {showAllFuture ? `Upcoming (${totalUpcomingShown})` : `Next 14 days (${upcoming14.length})`}
            {showPast ? ` + Past (${past.length})` : ''}
          </span>
        </div>

        <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          <button className="btn" onClick={()=>setShowAllFuture(v=>!v)}>
            {showAllFuture ? 'Show next 14 days' : 'Show all future'}
          </button>

          <button className="btn" onClick={()=>setShowPast(v=>!v)}>
            {showPast ? 'Hide past' : 'Show past'}
          </button>

          <Link to="/recurring" className="btn">
            Recurring templates
          </Link>

          <button
            className="btn primary"
            onClick={()=>{ if(typeof createMeeting === 'function') createMeeting() }}
            title={typeof createMeeting === 'function' ? 'Create a meeting' : 'createMeeting() not wired yet'}
          >
            New meeting
          </button>
        </div>
      </div>

      <div className="card-b">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width:110 }}>Date</th>
              <th style={{ width:90 }}>Time</th>
              <th>Meeting</th>
              <th style={{ width:110 }}>Items</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(m=>{
              const count = (state.items || []).filter(i=>i.meetingId===m.id).length
              const recurring = !!m.templateId
              return (
                <tr key={m.id} className="rowlink">
                  <td>{m.date}</td>
                  <td>{m.time || '—'}</td>
                  <td>
                    <Link to={`/meetings/${m.id}`} style={{ textDecoration:'underline' }}>
                      {m.title}
                    </Link>
                    {recurring ? <span className="pill" style={{ marginLeft:10 }}>recurring</span> : null}
                  </td>
                  <td><span className="pill">{count}</span></td>
                </tr>
              )
            })}

            {visible.length === 0 ? (
              <tr>
                <td colSpan="4" className="small">
                  No meetings to show. Create one or add recurring templates.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>

        {!showAllFuture && hiddenFutureCount > 0 ? (
          <div className="small" style={{ marginTop:10 }}>
            {hiddenFutureCount} future meeting{hiddenFutureCount===1?'':'s'} hidden (beyond 14 days).
          </div>
        ) : null}

        {!showPast && hiddenPastCount > 0 ? (
          <div className="small" style={{ marginTop:6 }}>
            {hiddenPastCount} past meeting{hiddenPastCount===1?'':'s'} hidden.
          </div>
        ) : null}
      </div>
    </div>
  )
}
