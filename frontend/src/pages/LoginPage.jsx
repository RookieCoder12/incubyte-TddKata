import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AuthLayout from '../components/AuthLayout.jsx'
import TextField from '../components/TextField.jsx'
import Button from '../components/Button.jsx'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(form)
      navigate('/')
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Check stock and sell from the lot."
      footer={<>New to the sales desk? <Link to="/register" className="font-medium text-accent hover:underline">Create an account</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <p role="alert" className="rounded-control bg-pill-negative-bg px-3 py-2 text-sm text-pill-negative-ink">
            {error}
          </p>
        )}
        <TextField label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required />
        <TextField label="Password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={handleChange} required />
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  )
}
