import React, { useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Nav from './components/Nav'
import Topbar from './components/Topbar'
import QuickAddModal from './components/QuickAddModal'

import Login from './pages/Login'
import Today from './pages/Today'
import Inbox from './pages/Inbox'
import Items from './pages/Items'
import Meetings from './pages/Meetings'
import MeetingDetail from './pages/MeetingDetail'

// NEW: recurring templates pages
import Recurring from './pages/Recurring'
import RecurringDetail from './pages/RecurringDetail'

import { isAuthed, signOut as doSignOut } from './state/auth'

function Protected({ children }){
  const loc = useLocation()
  if(!isAuthed()){
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  }
  return children
}

export default function App(){
  const nav = useNavigate()
  const loc = useLocation()
  const [quickOpen, setQuickOpen] = useState(false)
  const [quickMeetingId, setQuickMeetingId] = useState('')

  const page = useMemo(()=>{
    const p = loc.pathname
    if(p.startsWith('/inbox')) return { title:'Inbox', subtitle:'Capture + triage into tasks or chases' }
    if(p.startsWith('/items')) return { title:'Items', subtitle:'Full list for scanning and edits' }
    if(p.startsWith('/recurring')) return { title:'Recurring', subtitle:'Templates for your regular meetings' }
    if(p.startsWith('/meetings')) return { title:'Meetings', subtitle:'Agenda + notes + linked actions' }
    return { title:'Today', subtitle:'What to do now' }
  }, [loc.pathname])

  const onQuickAdd = ()=>{
    setQuickMeetingId('')
    setQuickOpen(true)
  }
  const onQuickAddFromMeeting = (meetingId)=>{
    setQuickMeetingId(meetingId)
    setQuickOpen(true)
  }
  const onSignOut = ()=>{
    doSignOut()
    nav('/login', { replace:true })
  }

  // Login route renders without shell
  if(loc.pathname.startsWith('/login')){
    return (
      <>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </>
    )
  }

  return (
    <div className="container">
      <Nav />
      <main className="main">
        <Topbar
          title={page.title}
          subtitle={page.subtitle}
          onQuickAdd={onQuickAdd}
          onSignOut={onSignOut}
        />

        <Protected>
          <Routes>
            <Route path="/" element={<Navigate to="/today" replace />} />

            <Route path="/today" element={<Today />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/items" element={<Items />} />

            <Route path="/meetings" element={<Meetings />} />
            <Route path="/meetings/:id" element={<MeetingDetail onQuickAddFromMeeting={onQuickAddFromMeeting} />} />

            {/* NEW: recurring templates */}
            <Route path="/recurring" element={<Recurring />} />
            <Route path="/recurring/:id" element={<RecurringDetail />} />

            <Route path="*" element={<Navigate to="/today" replace />} />
          </Routes>
        </Protected>

        <QuickAddModal
          open={quickOpen}
          meetingId={quickMeetingId}
          onClose={()=>setQuickOpen(false)}
        />
      </main>
    </div>
  )
}
