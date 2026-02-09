import React from 'react'
import { NavLink } from 'react-router-dom'
import { Icon } from './icons'

export default function Nav(){
  return (
    <div className="sidebar">
      <div className="brand">
        <div className="brand-badge">N</div>
        <div>
          <h1>Nudge</h1>
          <span>tasks • chases • meetings</span>
        </div>
      </div>

      <nav className="nav">
        <NavLink to="/today" className={({isActive})=> isActive ? 'active' : ''}>
          <Icon name="today" /> Today
        </NavLink>
        <NavLink to="/inbox" className={({isActive})=> isActive ? 'active' : ''}>
          <Icon name="inbox" /> Inbox
        </NavLink>
        <NavLink to="/items" className={({isActive})=> isActive ? 'active' : ''}>
          <Icon name="items" /> Items
        </NavLink>
        <NavLink to="/meetings" className={({isActive})=> isActive ? 'active' : ''}>
          <Icon name="meetings" /> Meetings
        </NavLink>
      </nav>

      <div style={{padding:'12px 10px', marginTop:'14px'}}>
        <div className="small">Tip: quick add works everywhere.</div>
      </div>
    </div>
  )
}
