import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { createRecord, updateRecord, getRecord } from '../services/api'
import { Spinner } from '../components/Feedback'

// All form fields definition
const SECTIONS = [
  {
    title: 'Basic Information',
    fields: [
      { key: 'title', label: 'Full Name / Title', type: 'text',   required: true, span: 2, placeholder: 'e.g. John Smith' },
      { key: 'age',   label: 'Age',               type: 'number', required: true, min: 0, max: 150, placeholder: '35' },
    ]
  },
  {
    title: 'Body Metrics',
    fields: [
      { key: 'bmi',                    label: 'BMI',               type: 'number', step: '0.1', min: 0, max: 100, placeholder: '24.5' },
      { key: 'bloodPressureSystolic',  label: 'BP Systolic (mmHg)',type: 'number', min: 0, max: 300, placeholder: '120' },
      { key: 'bloodPressureDiastolic', label: 'BP Diastolic (mmHg)',type: 'number', min: 0, max: 200, placeholder: '80' },
      { key: 'cholesterol',            label: 'Cholesterol (mg/dL)',type: 'number', min: 0, placeholder: '190' },
      { key: 'bloodSugar',             label: 'Blood Sugar (mg/dL)',type: 'number', step: '0.1', min: 0, placeholder: '95.0' },
    ]
  },
  {
    title: 'Lifestyle',
    fields: [
      { key: 'exerciseHoursPerWeek', label: 'Exercise (hrs/week)', type: 'number', step: '0.5', min: 0, placeholder: '3.5' },
      { key: 'sleepHoursPerDay',     label: 'Sleep (hrs/day)',     type: 'number', step: '0.5', min: 0, max: 24, placeholder: '7.5' },
      { key: 'alcoholUnitsPerWeek',  label: 'Alcohol (units/week)',type: 'number', min: 0, placeholder: '4' },
      { key: 'stressLevel',          label: 'Stress Level (1–10)', type: 'number', min: 1, max: 10, placeholder: '5' },
    ]
  }
]

const DEFAULTS = {
  title: '', age: '', bmi: '', bloodPressureSystolic: '',
  bloodPressureDiastolic: '', cholesterol: '', bloodSugar: '',
  exerciseHoursPerWeek: '', sleepHoursPerDay: '',
  smoking: false, alcoholUnitsPerWeek: '', stressLevel: ''
}

export default function RecordForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form,    setForm]    = useState(DEFAULTS)
  const [loading, setLoading] = useState(false)
  const [fetching,setFetching]= useState(isEdit)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!isEdit) return
    getRecord(id)
      .then(res => {
        const r = res.data
        setForm({
          title: r.title || '',
          age:   r.age   || '',
          bmi:   r.bmi   || '',
          bloodPressureSystolic:  r.bloodPressureSystolic  || '',
          bloodPressureDiastolic: r.bloodPressureDiastolic || '',
          cholesterol:            r.cholesterol            || '',
          bloodSugar:             r.bloodSugar             || '',
          exerciseHoursPerWeek:   r.exerciseHoursPerWeek   || '',
          sleepHoursPerDay:       r.sleepHoursPerDay       || '',
          smoking:                r.smoking                || false,
          alcoholUnitsPerWeek:    r.alcoholUnitsPerWeek    || '',
          stressLevel:            r.stressLevel            || '',
        })
      })
      .catch(() => navigate('/records'))
      .finally(() => setFetching(false))
  }, [id, isEdit])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Clean payload: convert empty strings to null
    const payload = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v === '' ? null : v])
    )

    try {
      if (isEdit) {
        await updateRecord(id, payload)
        navigate(`/records/${id}`)
      } else {
        const res = await createRecord(payload)
        navigate(`/records/${res.data.id}`)
      }
    } catch (err) {
      const data = err.response?.data
      if (data?.fieldErrors) {
        setError('Validation errors: ' + Object.entries(data.fieldErrors).map(([k, v]) => `${k}: ${v}`).join(', '))
      } else {
        setError(data?.message || 'Save failed. Please check your inputs.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <Spinner text="Loading record…" />

  return (
    <div className="max-w-2xl space-y-5">

      {/* Header */}
      <div className="animate-fade-in">
        <Link to="/records"
          className="text-xs text-navy-300 hover:text-navy-600 flex items-center gap-1 mb-3 w-fit">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Records
        </Link>
        <h2 className="font-display text-2xl text-navy-800">
          {isEdit ? 'Edit Health Record' : 'New Health Record'}
        </h2>
        <p className="text-sm text-navy-300 mt-1">
          {isEdit
            ? 'Update the health metrics below. Score is recalculated automatically.'
            : 'Fill in health metrics below. AI description is generated automatically after saving.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm animate-fade-in">
            {error}
          </div>
        )}

        {/* Form sections */}
        {SECTIONS.map((sec, si) => (
          <div key={sec.title}
            className="card animate-slide-up"
            style={{ animationDelay: `${si * 60}ms` }}>
            <h3 className="font-semibold text-navy-700 text-sm mb-4 pb-3 border-b border-navy-50">
              {sec.title}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {sec.fields.map(f => (
                <div key={f.key} className={f.span === 2 ? 'col-span-2' : ''}>
                  <label className="input-label">
                    {f.label}
                    {f.required && <span className="text-coral ml-0.5">*</span>}
                  </label>
                  <input
                    className="input"
                    type={f.type}
                    step={f.step}
                    min={f.min}
                    max={f.max}
                    required={f.required}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={set(f.key)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Smoking toggle */}
        <div className="card animate-slide-up" style={{ animationDelay: '180ms' }}>
          <h3 className="font-semibold text-navy-700 text-sm mb-4 pb-3 border-b border-navy-50">
            Smoking Status
          </h3>
          <label className="flex items-center justify-between cursor-pointer group">
            <div>
              <p className="text-sm font-medium text-navy-700">Currently smoking</p>
              <p className="text-xs text-navy-300 mt-0.5">
                {form.smoking ? 'Yes — this significantly affects the health score' : 'No — great for your health score'}
              </p>
            </div>
            <div className="relative flex-shrink-0">
              <input
                type="checkbox"
                checked={form.smoking}
                onChange={e => setForm(f => ({ ...f, smoking: e.target.checked }))}
                className="sr-only"
              />
              <div
                onClick={() => setForm(f => ({ ...f, smoking: !f.smoking }))}
                className={`w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                  form.smoking ? 'bg-coral' : 'bg-navy-100'
                }`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  form.smoking ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </div>
            </div>
          </label>
        </div>

        {/* Score preview */}
        <div className="card !py-3 !px-4 bg-navy-50 border-navy-100 animate-slide-up" style={{ animationDelay: '210ms' }}>
          <div className="flex items-center gap-2 text-xs text-navy-400">
            <svg className="w-4 h-4 text-mint" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Health score is automatically calculated by the backend when you save. AI description is generated asynchronously within a few seconds.
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 animate-slide-up" style={{ animationDelay: '240ms' }}>
          <button type="submit" disabled={loading}
            className="btn-primary disabled:opacity-60">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{isEdit ? 'Updating…' : 'Creating…'}</>
              : isEdit ? 'Update Record' : 'Create Record'
            }
          </button>
          <Link to={isEdit ? `/records/${id}` : '/records'} className="btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
