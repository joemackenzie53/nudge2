import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn } from '../state/auth'

export default function Login(){
  const nav = useNavigate()
  const [user, setUser] = useState('')
  const [pw, setPw] = useState('')

  const submit = (e)=>{
    e.preventDefault()
    const u = user.trim()
    if(!u) return
    signIn({ user: u })
    nav('/today', { replace:true })
  }

  return (
    <div className="loginWrap">
      <div className="loginCard">
        <div className="loginHeader">
          <div className="badge">N</div>
          <div className="loginTitle">
            <h1>Nudge</h1>
            <p>Lightweight tracker for tasks, chases, and meetings.</p>
          </div>
        </div>

        <form onSubmit={submit} className="stack" style={{marginTop:12}}>
          <div className="field">
            <label>Username</label>
            <input className="input" value={user} onChange={e=>setUser(e.target.value)} placeholder="e.g., joe" />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="anything (mock)" />
          </div>
          <button className="btn primary" type="submit">Sign in</button>
        </form>

        <div className="footerNote">Mock login. Data is stored locally in your browser.</div>
      </div>
    </div>
  )
}
