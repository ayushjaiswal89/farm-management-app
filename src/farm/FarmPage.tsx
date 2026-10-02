import { useEffect, useMemo, useState } from 'react'
import {
  Bell,
  ChevronRight,
  CircleHelp,
  FileText,
  HandCoins,
  Home,
  Languages,
  Leaf,
  MoreVertical,
  Moon,
  Pencil,
  Plus,
  ReceiptIndianRupee,
  Sprout,
  Sun,
  Trash2,
  Wheat,
} from 'lucide-react'
import { FarmForm } from './FarmForm'
import { KhetDetail } from './KhetDetail'
import { areaUnitName, copy, cropNames, money, type Lang } from './farmI18n'
import type { Farm, FarmRecord } from './types'

const starterFarms: Farm[] = [
  { id: 'khet-2', name: 'Khet 2', crop: 'Maize', area: 2.5, areaUnit: 'Bigha', sowingDate: '2026-07-02', harvestDate: '2026-11-08' },
  { id: 'khet-1', name: 'Khet 1', crop: 'Soybean', area: 3.5, areaUnit: 'Bigha', sowingDate: '2026-06-17', harvestDate: '2026-10-18' },
]

const starterRecords: FarmRecord[] = [
  { id: 'r1', farmId: 'khet-1', type: 'expense', date: '2026-06-17', category: 'बीज', amount: 5034, quantity: 0, unit: 'Kg', note: 'सोयाबीन बीज' },
  { id: 'r2', farmId: 'khet-1', type: 'expense', date: '2026-06-20', category: 'खाद', amount: 10000, quantity: 0, unit: 'Kg', note: 'खाद और दवाई' },
  { id: 'r3', farmId: 'khet-2', type: 'expense', date: '2026-07-02', category: 'बीज', amount: 5200, quantity: 0, unit: 'Kg', note: 'मक्का बीज' },
]

function stored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export function FarmPage() {
  const [lang, setLang] = useState<Lang>(() => stored('sk-lang', 'hi'))
  const [dark, setDark] = useState(() => stored('sk-dark', false))
  const [farms, setFarms] = useState<Farm[]>(() => stored('sk-farms-v2', starterFarms))
  const [records, setRecords] = useState<FarmRecord[]>(() => stored('sk-records-v2', starterRecords))
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [menuId, setMenuId] = useState<string | null>(null)
  const t = copy[lang]

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('sk-dark', JSON.stringify(dark))
  }, [dark])
  useEffect(() => localStorage.setItem('sk-lang', JSON.stringify(lang)), [lang])
  useEffect(() => localStorage.setItem('sk-farms-v2', JSON.stringify(farms)), [farms])
  useEffect(() => localStorage.setItem('sk-records-v2', JSON.stringify(records)), [records])

  const totals = useMemo(() => {
    const income = records.filter((record) => record.type === 'income').reduce((sum, record) => sum + record.amount, 0)
    const expense = records.filter((record) => record.type === 'expense').reduce((sum, record) => sum + record.amount, 0)
    return { income, expense }
  }, [records])

  const saveFarm = (farm: Farm) => {
    setFarms((current) => current.some((item) => item.id === farm.id)
      ? current.map((item) => item.id === farm.id ? farm : item)
      : [farm, ...current])
    setFormOpen(false)
    setEditingFarm(null)
  }

  const deleteFarm = (id: string) => {
    setFarms((current) => current.filter((farm) => farm.id !== id))
    setRecords((current) => current.filter((record) => record.farmId !== id))
    setSelectedId(null)
    setMenuId(null)
  }

  const selectedFarm = farms.find((farm) => farm.id === selectedId)
  if (selectedFarm) {
    return (
      <div className="min-h-dvh bg-[var(--sk-bg)] text-[var(--sk-text)]">
        <KhetDetail
          lang={lang}
          farm={selectedFarm}
          records={records.filter((record) => record.farmId === selectedFarm.id)}
          onBack={() => setSelectedId(null)}
          onEditFarm={() => { setEditingFarm(selectedFarm); setFormOpen(true) }}
          onDeleteFarm={() => deleteFarm(selectedFarm.id)}
          onSaveRecord={(record) => setRecords((current) => [record, ...current])}
          onDeleteRecord={(id) => setRecords((current) => current.filter((record) => record.id !== id))}
        />
        {formOpen && <FarmForm lang={lang} farm={editingFarm} onSave={saveFarm} onClose={() => { setFormOpen(false); setEditingFarm(null) }} />}
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[var(--sk-bg)] text-[var(--sk-text)]">
      <TopBar lang={lang} dark={dark} onLang={() => setLang(lang === 'hi' ? 'en' : 'hi')} onDark={() => setDark(!dark)} />

      <main className="mx-auto w-full max-w-3xl px-4 pb-36 sm:px-6">
        <section className="-mx-4 border-b border-green-900/5 bg-[var(--sk-summary)] px-4 pb-7 pt-8 sm:-mx-6 sm:px-6">
          <div className="mx-auto grid max-w-xl grid-cols-2">
            <SummaryStat
              icon={<HandCoins size={36} strokeWidth={1.8} />}
              label={t.totalIncome}
              value={money(totals.income)}
              tone="income"
            />
            <SummaryStat
              icon={<ReceiptIndianRupee size={36} strokeWidth={1.8} />}
              label={t.totalExpense}
              value={money(totals.expense)}
              tone="expense"
              divided
            />
          </div>
          <p className={`mt-4 text-center text-xl font-extrabold ${totals.income - totals.expense >= 0 ? 'text-[var(--sk-green)]' : 'text-[var(--sk-orange-red)]'}`}>
            {t.balance} &nbsp;{money(totals.income - totals.expense)}
          </p>
        </section>

        <div className="mb-5 mt-7 flex items-center justify-between gap-3">
          <p className="text-xl font-bold text-[var(--sk-heading)]">{lang === 'hi' ? 'मेरे खेत' : 'My farms'}</p>
          <button
            onClick={() => setFormOpen(true)}
            className="flex h-12 shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--sk-orange)] to-[var(--sk-lime)] px-3.5 text-base font-bold text-white shadow-md shadow-orange-900/10 transition active:scale-[.98]"
          >
            <span className="grid size-8 place-items-center rounded-full bg-white text-[var(--sk-orange)]"><Plus size={19} strokeWidth={2.5} /></span>
            {t.addFarm}
          </button>
        </div>

        <div className="space-y-4">
          {farms.length === 0 ? (
            <div className="rounded-[1.75rem] bg-[var(--sk-card)] px-6 py-14 text-center shadow-[0_10px_28px_rgba(26,65,38,.08)]">
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-green-500/10 text-[var(--sk-green)]"><Sprout size={31} /></div>
              <p className="mt-4 text-lg font-bold">{t.noFarms}</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-[var(--sk-dim)]">{t.noFarmsSub}</p>
            </div>
          ) : farms.map((farm) => {
            const farmRecords = records.filter((record) => record.farmId === farm.id)
            const income = farmRecords.filter((record) => record.type === 'income').reduce((sum, record) => sum + record.amount, 0)
            const expense = farmRecords.filter((record) => record.type === 'expense').reduce((sum, record) => sum + record.amount, 0)
            return (
              <article
                key={farm.id}
                className="relative overflow-visible rounded-[1.75rem] bg-[var(--sk-card)] shadow-[0_10px_28px_rgba(26,65,38,.09)]"
              >
                <div className="absolute bottom-3 left-0 top-3 w-1.5 rounded-r-full bg-[var(--sk-orange-red)]" />
                <div className="px-5 pb-4 pt-5 sm:px-7">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xl font-extrabold tracking-tight">{farm.name}</p>
                      <p className="mt-1 truncate text-lg font-bold text-[var(--sk-heading)]">
                        {cropNames[farm.crop]?.[lang] ?? farm.crop}
                        <span className="font-medium"> ({farm.crop})</span>
                        <span className="mx-2 font-normal text-[var(--sk-dim)]">·</span>
                        <span className="font-medium">{farm.area} {areaUnitName(farm.areaUnit, lang)}</span>
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        aria-label="Farm menu"
                        onClick={() => setMenuId(menuId === farm.id ? null : farm.id)}
                        className="grid size-9 place-items-center rounded-xl text-[var(--sk-dim)] hover:bg-[var(--sk-card2)]"
                      >
                        <MoreVertical size={19} />
                      </button>
                      {menuId === farm.id && (
                        <div className="absolute right-0 top-10 z-20 w-36 overflow-hidden rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card)] p-1 shadow-xl">
                          <button onClick={() => { setEditingFarm(farm); setFormOpen(true); setMenuId(null) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-[var(--sk-card2)]"><Pencil size={14} />{t.edit}</button>
                          <button onClick={() => confirm(t.confirmFarm) && deleteFarm(farm.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-500/10"><Trash2 size={14} />{t.delete}</button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 h-px bg-[var(--sk-border)]" />
                  <div className="mt-3 grid grid-cols-[1fr_1fr_auto] items-center">
                    <div>
                      <p className="text-sm text-[var(--sk-dim)]">{t.totalIncome}</p>
                      <p className="mt-0.5 text-lg font-bold text-[var(--sk-income)]">{money(income)}</p>
                    </div>
                    <div className="border-l border-[var(--sk-border)] pl-4">
                      <p className="text-sm text-[var(--sk-dim)]">{t.totalExpense}</p>
                      <p className="mt-0.5 text-lg font-bold text-[var(--sk-orange-red)]">{money(expense)}</p>
                    </div>
                    <button
                      onClick={() => setSelectedId(farm.id)}
                      className="ml-3 flex items-center gap-1 text-base font-bold text-[var(--sk-orange)]"
                    >
                      {t.details}<ChevronRight size={20} strokeWidth={2.6} />
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </main>

      <BottomBar lang={lang} onAdd={() => setFormOpen(true)} />
      {formOpen && <FarmForm lang={lang} farm={editingFarm} onSave={saveFarm} onClose={() => { setFormOpen(false); setEditingFarm(null) }} />}
    </div>
  )
}

function TopBar({ lang, dark, onLang, onDark }: { lang: Lang; dark: boolean; onLang: () => void; onDark: () => void }) {
  return (
    <header className="sticky top-0 z-30 bg-[var(--sk-green-deep)] text-white shadow-sm">
      <div className="mx-auto flex h-[4.75rem] max-w-3xl items-center justify-between gap-2 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Wheat className="shrink-0 text-lime-300" size={24} />
          <p className="truncate text-xl font-extrabold tracking-tight">Smart Khaata</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="hidden rounded-full border-2 border-amber-400 px-3 py-1.5 text-xs font-extrabold text-amber-300 min-[430px]:inline-flex">
            {lang === 'hi' ? 'किसान/प्रो' : 'Kisan/Pro'}
          </span>
          <button aria-label="Help" className="grid size-10 place-items-center rounded-full hover:bg-white/10"><CircleHelp size={24} /></button>
          <button aria-label="Notifications" className="hidden size-10 place-items-center rounded-full hover:bg-white/10 min-[390px]:grid"><Bell size={23} /></button>
          <button onClick={onDark} aria-label="Toggle theme" className="grid size-10 place-items-center rounded-full hover:bg-white/10">{dark ? <Sun size={22} /> : <Moon size={22} />}</button>
          <button onClick={onLang} aria-label="Change language" className="grid size-10 place-items-center rounded-full hover:bg-white/10"><Languages size={25} /></button>
        </div>
      </div>
    </header>
  )
}

function SummaryStat({ icon, label, value, tone, divided = false }: { icon: React.ReactNode; label: string; value: string; tone: 'income' | 'expense'; divided?: boolean }) {
  return (
    <div className={`flex flex-col items-center px-3 py-1 text-center ${divided ? 'border-l border-[var(--sk-border)]' : ''}`}>
      <div className={tone === 'income' ? 'text-[var(--sk-income)]' : 'text-[var(--sk-orange-red)]'}>{icon}</div>
      <p className="mt-3 text-lg font-bold text-[var(--sk-heading)]">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${tone === 'income' ? 'text-[var(--sk-income)]' : 'text-[var(--sk-orange-red)]'}`}>{value}</p>
    </div>
  )
}

function BottomBar({ lang, onAdd }: { lang: Lang; onAdd: () => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto h-[5.25rem] max-w-3xl rounded-t-3xl border-t border-[var(--sk-border)] bg-[var(--sk-card)] shadow-[0_-8px_24px_rgba(35,66,45,.08)]">
      <div className="grid h-full grid-cols-5 items-center px-2">
        <NavItem icon={<Home size={22} />} label={lang === 'hi' ? 'होम' : 'Home'} />
        <NavItem icon={<FileText size={22} />} label={lang === 'hi' ? 'अखवाल' : 'Records'} />
        <button onClick={onAdd} aria-label={lang === 'hi' ? 'लेन-देन जोड़ें' : 'Add transaction'} className="relative h-full">
          <span className="absolute left-1/2 top-0 grid size-[4.9rem] -translate-x-1/2 -translate-y-7 place-items-center rounded-full border-[0.45rem] border-[var(--sk-bg)] bg-[#89958e] text-4xl font-medium text-white shadow-lg">₹</span>
        </button>
        <NavItem active icon={<Leaf size={24} />} label={lang === 'hi' ? 'खेती' : 'Farms'} />
        <NavItem icon={<MoreVertical size={24} />} label={lang === 'hi' ? 'अधिक' : 'More'} />
      </div>
    </nav>
  )
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button aria-disabled={!active} className={`flex h-full flex-col items-center justify-center gap-1 text-[11px] font-bold ${active ? 'text-[var(--sk-orange)]' : 'text-[var(--sk-dim)]'}`}>
      {icon}<span>{label}</span>
    </button>
  )
}
