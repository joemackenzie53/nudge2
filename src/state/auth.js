const AUTH_KEY = 'nudge_auth_v1'

export function getAuth(){
  try{
    return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null')
  }catch{
    return null
  }
}
export function isAuthed(){
  const a = getAuth()
  return !!(a && a.user)
}
export function signIn({ user }){
  localStorage.setItem(AUTH_KEY, JSON.stringify({ user, ts: Date.now() }))
}
export function signOut(){
  localStorage.removeItem(AUTH_KEY)
}
