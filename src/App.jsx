import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'

const readStore = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? [] } catch { return [] }
}
const writeStore = (key, value) => localStorage.setItem(key, JSON.stringify(value))

function Navbar({ children, onLogout }) {
  return <nav><Link className="brand" to="/">🍱 FoodCare</Link><div className="nav-links">{children}{onLogout && <button className="nav-logout" onClick={onLogout}>Logout</button>}</div></nav>
}

function Home() {
  return <>
    <Navbar><a href="#home">Home</a><a href="#about">About</a></Navbar>
    <section className="hero" id="home"><div className="hero-content">
      <div className="hero-icon">🍱</div><h1>Food Waste Management System</h1>
      <p className="hero-tagline">Don't Waste Food. Share Food.<br />Help People. Save the Planet. 🌱</p>
      <p className="description">FoodCare connects individuals and organizations with surplus food to charities and food recipients.</p>
      <h2>Choose Your Role</h2>
      <div className="role-container">
        <article className="role-card"><div className="role-icon">👤</div><h3>Food Recipient</h3><p>Find surplus food near your location and claim it for distribution.</p><Link className="primary-button" to="/user">User Login / Sign Up</Link></article>
        <article className="role-card"><div className="role-icon">🏪</div><h3>Food Donor / Owner</h3><p>Post your surplus food and connect with nearby charities and food recipients.</p><Link className="primary-button" to="/owner">Owner Login / Sign Up</Link></article>
      </div>
    </div></section>
    <section className="about" id="about"><h2>How FoodCare Works</h2><div className="steps">
      {[['🏪','1. Donate','Owners post surplus food with quantity, location and expiry details.'],['📍','2. Match','Users find available food based on their location.'],['🍱','3. Claim','Recipients claim the available food.'],['📧','4. Notify','The demo displays email/SMS notification messages.'],['🌱','5. Reduce Waste','Surplus food is distributed instead of being wasted.']].map(([icon,title,desc]) => <article className="step" key={title}><div>{icon}</div><h3>{title}</h3><p>{desc}</p></article>)}
    </div></section>
    <footer><h3>🍱 FoodCare</h3><p>Reducing Food Waste • Helping Communities</p><p>© 2026 Food Waste Management System</p></footer>
  </>
}

function AuthPage({ role, accounts, onAccountsChange, onLogin }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', phone: '', location: '', password: '', confirm: '' })
  const [message, setMessage] = useState('')
  const isOwner = role === 'owner'
  const label = isOwner ? 'Owner' : 'User'
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  const submitSignup = (event) => {
    event.preventDefault()
    const email = form.email.trim().toLowerCase()
    if (!form.name.trim() || !email || !form.phone.trim() || !form.location.trim() || !form.password || !form.confirm) return setMessage('Please fill all fields.')
    if (form.password !== form.confirm) return setMessage('Passwords do not match.')
    if (accounts.some((account) => account.email.toLowerCase() === email)) return setMessage('Email already registered. Please log in.')
    const account = { id: Date.now(), name: form.name.trim(), email, phone: form.phone.trim(), location: form.location.trim(), password: form.password }
    const next = [...accounts, account]
    onAccountsChange(next)
    setMessage('Account created successfully! Please log in.')
    setMode('login')
    setForm({ ...form, password: '', confirm: '' })
  }
  const submitLogin = (event) => {
    event.preventDefault()
    const account = accounts.find((item) => item.email.toLowerCase() === form.email.trim().toLowerCase() && item.password === form.password)
    if (!account) return setMessage('Invalid email or password. If you are new, please sign up first.')
    onLogin(account)
  }
  return <main className="auth-container"><section className="auth-box">
    <Link className="back-home" to="/">← Back to Home</Link><div className="logo">🍱</div><h1>FoodCare</h1><p>Share Surplus Food • Reduce Waste</p>
    <h2>{mode === 'login' ? `${label} Login` : `Create ${label} Account`}</h2>
    <form onSubmit={mode === 'login' ? submitLogin : submitSignup}>
      {mode === 'signup' && <>
        <input name="name" value={form.name} onChange={update} placeholder={isOwner ? 'Owner / Organization Name' : 'Full Name'} required />
        <input name="phone" type="tel" value={form.phone} onChange={update} placeholder="Mobile Number" required />
        <input name="location" value={form.location} onChange={update} placeholder={isOwner ? 'Organization Location' : 'Your Location'} required />
      </>}
      <input name="email" type="email" value={form.email} onChange={update} placeholder="Email Address" required />
      <input name="password" type="password" value={form.password} onChange={update} placeholder="Password" required />
      {mode === 'signup' && <input name="confirm" type="password" value={form.confirm} onChange={update} placeholder="Confirm Password" required />}
      <button className="primary-button" type="submit">{mode === 'login' ? 'Login' : 'Create Account'}</button>
    </form>
    {message && <p className="form-message" role="status">{message}</p>}
    <p className="switch-auth">{mode === 'login' ? "Don't have an account?" : 'Already have an account?'} <button className="text-button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage('') }}>{mode === 'login' ? 'Sign Up' : 'Login'}</button></p>
  </section></main>
}

function OwnerDashboard({ owner, donations, setDonations, onLogout }) {
  const mine = donations.filter((food) => food.ownerId === owner.id)
  const [notice, setNotice] = useState('')
  const [foodForm, setFoodForm] = useState({ food: '', quantity: '', type: '', location: owner.location, expiry: '', details: '' })
  const counts = { total: mine.length, available: mine.filter(f => f.status === 'Available').length, claimed: mine.filter(f => f.status === 'Claimed').length, distributed: mine.filter(f => f.status === 'Distributed').length }
  const alerts = mine.filter((food) => food.status === 'Available').map((food) => ({ ...food, remaining: new Date(food.expiry).getTime() - Date.now() })).filter((food) => food.remaining <= 3 * 60 * 60 * 1000)
  const submitFood = (event) => {
    event.preventDefault()
    if (new Date(foodForm.expiry).getTime() <= Date.now()) return setNotice('Expiry time must be in the future.')
    const donation = { ...foodForm, id: Date.now(), ownerId: owner.id, owner: owner.name, ownerEmail: owner.email, ownerPhone: owner.phone, status: 'Available', createdAt: new Date().toISOString(), claimedBy: '', claimedEmail: '', claimedPhone: '', claimedAt: '' }
    const next = [...donations, donation]
    setDonations(next); writeStore('donations', next)
    setFoodForm({ food: '', quantity: '', type: '', location: owner.location, expiry: '', details: '' })
    setNotice('Food donation posted successfully!')
  }
  const markDistributed = (id) => {
    const next = donations.map((food) => food.id === id ? { ...food, status: 'Distributed' } : food)
    setDonations(next); writeStore('donations', next)
  }
  return <>
    <Navbar onLogout={onLogout}><a href="#dashboard">Dashboard</a><a href="#postFood">Post Food</a><a href="#history">History</a></Navbar>
    <section className="welcome"><h1>Welcome, {owner.name} 👋</h1><p>Donate surplus food and help people in need.</p></section>
    {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice('')}>×</button></div>}
    <section className="section" id="dashboard"><h2>📊 Donation Dashboard</h2><div className="stats-grid">{[['Total Donations',counts.total],['Available Food',counts.available],['Food Claimed',counts.claimed],['Food Distributed',counts.distributed]].map(([name,value]) => <article className="stat-card" key={name}><h3>{value}</h3><p>{name}</p></article>)}</div></section>
    <section className="section" id="postFood"><h2>🍱 Post Surplus Food</h2><form className="form-card" onSubmit={submitFood}>
      <label>Food Name</label><input value={foodForm.food} onChange={e => setFoodForm({...foodForm,food:e.target.value})} placeholder="Example: Rice & Curry" required />
      <label>Quantity (number of meals)</label><input type="number" min="1" value={foodForm.quantity} onChange={e => setFoodForm({...foodForm,quantity:e.target.value})} required />
      <label>Food Type</label><select value={foodForm.type} onChange={e => setFoodForm({...foodForm,type:e.target.value})} required><option value="">Select Food Type</option>{['Cooked Food','Packaged Food','Fruits','Vegetables','Bakery','Other'].map(x => <option key={x}>{x}</option>)}</select>
      <label>Pickup Location</label><input value={foodForm.location} onChange={e => setFoodForm({...foodForm,location:e.target.value})} required />
      <label>Food Expiry Date & Time</label><input type="datetime-local" min={new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16)} value={foodForm.expiry} onChange={e => setFoodForm({...foodForm,expiry:e.target.value})} required />
      <label>Additional Details</label><textarea value={foodForm.details} onChange={e => setFoodForm({...foodForm,details:e.target.value})} placeholder="Food details and pickup instructions" />
      <button className="primary-button" type="submit">🍱 Post Food Donation</button>
    </form></section>
    <section className="section"><h2>⚠️ Perishable Food Alerts</h2>{alerts.length ? alerts.map(food => <div className={food.remaining <= 0 ? 'danger-alert' : 'urgent'} key={food.id}>{food.remaining <= 0 ? '❌' : '⚠️'} <b>{food.food}</b> {food.remaining <= 0 ? 'has expired.' : `is expiring in about ${Math.ceil(food.remaining / 3600000)} hour(s)!`} — {food.location}</div>) : <div className="empty">✅ No urgent expiry alerts.</div>}</section>
    <section className="section" id="history"><h2>📋 My Donation History</h2><div className="food-grid">{mine.length ? [...mine].reverse().map(food => <FoodCard key={food.id} food={food}>{food.status === 'Claimed' && <button className="secondary-button" onClick={() => markDistributed(food.id)}>Mark as Distributed</button>}</FoodCard>) : <div className="empty">🍱 No donations yet. Post your first surplus food donation.</div>}</div></section>
  </>
}

function FoodCard({ food, children, onClaim }) {
  const expired = new Date(food.expiry).getTime() <= Date.now()
  return <article className="food-card">{expired && food.status === 'Available' && <div className="danger-alert">Expired</div>}<div className="food-icon">🍱</div><h3>{food.food}</h3><p><b>Quantity:</b> {food.quantity} meals</p><p><b>Type:</b> {food.type}</p><p>📍 {food.location}</p><p>⏰ {new Date(food.expiry).toLocaleString()}</p>{food.details && <p>{food.details}</p>}<p><b>Donated by:</b> {food.owner}</p>{food.claimedBy && <><p><b>Claimed by:</b> {food.claimedBy}</p><p>{food.claimedEmail}</p></>}<span className={`status ${food.status.toLowerCase()}`}>{food.status}</span>{onClaim && food.status === 'Available' && !expired && <button className="primary-button claim" onClick={() => onClaim(food.id)}>Claim Food 🍱</button>}{children}</article>
}

function UserDashboard({ user, donations, setDonations, onLogout }) {
  const [location, setLocation] = useState(user.location)
  const [filter, setFilter] = useState('')
  const [notice, setNotice] = useState('')
  const available = useMemo(() => donations.filter(food => food.status === 'Available' && new Date(food.expiry).getTime() > Date.now() && (!filter || food.location.toLowerCase().includes(filter.toLowerCase()))), [donations, filter])
  const history = donations.filter(food => food.claimedEmail === user.email)
  const claimFood = (id) => {
    const target = donations.find(food => food.id === id)
    if (!target || target.status !== 'Available') return setNotice('This food is no longer available.')
    const next = donations.map(food => food.id === id ? { ...food, status: 'Claimed', claimedBy: user.name, claimedEmail: user.email, claimedPhone: user.phone, claimedAt: new Date().toISOString() } : food)
    setDonations(next); writeStore('donations', next)
    setNotice(`Food claimed successfully! Demo email/SMS notification shown for ${user.email} and ${user.phone}.`)
  }
  return <>
    <Navbar onLogout={onLogout}><a href="#home">Home</a><a href="#food">Available Food</a><a href="#history">My Claims</a></Navbar>
    <section className="welcome" id="home"><h1>Welcome, {user.name} 👋</h1><p>Find surplus food near you and help distribute it to people in need.</p></section>
    {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice('')}>×</button></div>}
    <section className="section"><h2>📍 Find Food Near You</h2><div className="location-box"><input value={location} onChange={e => setLocation(e.target.value)} placeholder="Enter your location" /><button className="primary-button" onClick={() => setFilter(location.trim())}>Find Food</button><button className="secondary-button" onClick={() => {setFilter('');setLocation('')}}>Show All</button></div></section>
    <section className="section" id="food"><h2>🍱 Available Surplus Food</h2><div className="food-grid">{available.length ? available.map(food => <FoodCard key={food.id} food={food} onClaim={claimFood} />) : <div className="empty">🍽️ No available food found. Try another location or check again later.</div>}</div></section>
    <section className="section" id="history"><h2>📋 My Claim History</h2><div className="food-grid">{history.length ? history.map(food => <FoodCard key={food.id} food={food} />) : <div className="empty">No claim history yet.</div>}</div></section>
  </>
}

export default function App() {
  const [users, setUsers] = useState(() => readStore('users'))
  const [owners, setOwners] = useState(() => readStore('owners'))
  const [donations, setDonations] = useState(() => readStore('donations'))
  const [currentUser, setCurrentUser] = useState(() => { try { return JSON.parse(localStorage.getItem('currentUser')) } catch { return null } })
  const [currentOwner, setCurrentOwner] = useState(() => { try { return JSON.parse(localStorage.getItem('currentOwner')) } catch { return null } })
  const navigate = useNavigate()
  useEffect(() => writeStore('users', users), [users])
  useEffect(() => writeStore('owners', owners), [owners])
  const login = (account, role) => {
    if (role === 'user') { setCurrentUser(account); localStorage.setItem('currentUser', JSON.stringify(account)); navigate('/user/dashboard') }
    else { setCurrentOwner(account); localStorage.setItem('currentOwner', JSON.stringify(account)); navigate('/owner/dashboard') }
  }
  const logout = (role) => {
    if (role === 'user') { setCurrentUser(null); localStorage.removeItem('currentUser'); navigate('/user') }
    else { setCurrentOwner(null); localStorage.removeItem('currentOwner'); navigate('/owner') }
  }
  return <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/user" element={<AuthPage role="user" accounts={users} onAccountsChange={setUsers} onLogin={account => login(account,'user')} />} />
    <Route path="/owner" element={<AuthPage role="owner" accounts={owners} onAccountsChange={setOwners} onLogin={account => login(account,'owner')} />} />
    <Route path="/user/dashboard" element={currentUser ? <UserDashboard user={currentUser} donations={donations} setDonations={setDonations} onLogout={() => logout('user')} /> : <Navigate to="/user" replace />} />
    <Route path="/owner/dashboard" element={currentOwner ? <OwnerDashboard owner={currentOwner} donations={donations} setDonations={setDonations} onLogout={() => logout('owner')} /> : <Navigate to="/owner" replace />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
