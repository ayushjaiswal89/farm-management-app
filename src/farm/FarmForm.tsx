import { useEffect, useState, type FormEvent } from 'react'
import { CalendarDays, MapPin, Save, Sprout, X } from 'lucide-react'
import { areaUnits, copy, cropNames, type Lang } from './farmI18n'
import type { Farm } from './types'

interface FarmFormProps {
  lang: Lang
  farm?: Farm | null
  onSave: (farm: Farm) => void
  onClose: () => void
}

const today = () => new Date().toISOString().slice(0, 10)
const fieldClass =
  'h-12 w-full rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] px-3.5 text-sm text-[var(--sk-text)] outline-none transition focus:border-[var(--sk-green)] focus:ring-2 focus:ring-green-500/10'

export function FarmForm({ lang, farm, onSave, onClose }: FarmFormProps) {
  const t = copy[lang]
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    crop: 'Soybean',
    area: '',
    areaUnit: 'Bigha',
    sowingDate: today(),
    harvestDate: '',
  })

  useEffect(() => {
    if (farm) {
      setForm({
        name: farm.name,
        crop: farm.crop,
        area: String(farm.area),
        areaUnit: farm.areaUnit,
        sowingDate: farm.sowingDate,
        harvestDate: farm.harvestDate,
      })
    }
  }, [farm])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!form.name.trim() || !form.area || !form.sowingDate) {
      setError(t.required)
      return
    }
    onSave({
      id: farm?.id ?? crypto.randomUUID(),
      name: form.name.trim(),
      crop: form.crop,
      area: Number(form.area),
      areaUnit: form.areaUnit,
      sowingDate: form.sowingDate,
      harvestDate: form.harvestDate,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <section
        aria-modal="true"
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-[var(--sk-border)] bg-[var(--sk-card)] shadow-2xl sm:max-w-xl sm:rounded-3xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--sk-border)] bg-[var(--sk-card)] px-5 py-4">
          <div>
            <p className="text-lg font-bold text-[var(--sk-text)]">{farm ? t.editFarm : t.addFarm}</p>
            <p className="mt-0.5 text-xs text-[var(--sk-dim)]">{t.intro}</p>
          </div>
          <button
            type="button"
            aria-label={t.cancel}
            onClick={onClose}
            className="grid size-10 place-items-center rounded-xl bg-[var(--sk-card2)] text-[var(--sk-dim)] transition hover:text-[var(--sk-text)]"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 p-5 sm:p-6">
          <div className="rounded-2xl bg-green-500/10 p-4 text-sm text-[var(--sk-green)]">
            <Sprout className="mb-2" size={22} />
            {lang === 'hi'
              ? 'खेत और फसल की मूल जानकारी भरें। बाद में इसमें खर्च, बिक्री और पैदावार जोड़ सकते हैं।'
              : 'Add the basic field and crop information. You can track expenses, sales and yield next.'}
          </div>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold"><MapPin size={15} />{t.farmName} *</span>
            <input
              autoFocus
              className={fieldClass}
              placeholder={lang === 'hi' ? 'जैसे: नदी वाला खेत' : 'e.g. Riverside field'}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">{t.crop}</span>
              <select className={fieldClass} value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })}>
                {Object.entries(cropNames).map(([value, labels]) => <option key={value} value={value}>{labels[lang]}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">{t.area} *</span>
              <input className={fieldClass} type="number" min="0.01" step="0.01" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="0.00" />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">{t.areaUnit}</span>
            <select className={fieldClass} value={form.areaUnit} onChange={(e) => setForm({ ...form, areaUnit: e.target.value })}>
              {Object.entries(areaUnits).map(([value, labels]) => <option key={value} value={value}>{labels[lang]}</option>)}
            </select>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold"><CalendarDays size={15} />{t.sowingDate} *</span>
              <input className={fieldClass} type="date" value={form.sowingDate} onChange={(e) => setForm({ ...form, sowingDate: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold"><CalendarDays size={15} />{t.harvestDate}</span>
              <input className={fieldClass} type="date" value={form.harvestDate} onChange={(e) => setForm({ ...form, harvestDate: e.target.value })} />
            </label>
          </div>

          {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="h-12 flex-1 rounded-xl border border-[var(--sk-border)] font-semibold text-[var(--sk-dim)]">{t.cancel}</button>
            <button type="submit" className="flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-xl bg-[var(--sk-green-deep)] font-bold text-white shadow-lg shadow-green-900/15 transition active:scale-[.98]">
              <Save size={18} />{t.save}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
