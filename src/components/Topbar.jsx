import React from 'react'
import { Icon } from './icons'

export default function Topbar({ title, subtitle, onQuickAdd, onSignOut }){
  return (
    <div className="topbar">
      <div>
        <h2>{title}</h2>
        {subtitle ? <div className="sub">{subtitle}</div> : null}
      </div>

      <div className="actions">
        <button className="btn primary" onClick={onQuickAdd}>
          <span style={{display:'inline-flex', gap:8, alignItems:'center'}}>
            <Icon name="plus" /> Quick add
          </span>
        </button>
        <button className="btn ghost" onClick={onSignOut} title="Sign out">
          <span style={{display:'inline-flex', gap:8, alignItems:'center'}}>
            <Icon name="logout" /> Sign out
          </span>
        </button>
      </div>
    </div>
  )
}
