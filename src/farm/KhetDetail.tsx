import { useMemo, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  ChevronDown,
  FileText,
  HandCoins,
  MoreVertical,
  Plus,
  ReceiptIndianRupee,
  RefreshCw,
  TrendingUp,
  Trash2,
} from 'lucide-react'
import { copy, money, type Lang } from './farmI18n'
import type { Farm, FarmRecord, RecordType } from './types'

interface Props {
  lang: Lang
  farm: Farm
  records: FarmRecord[]
  onBack: () => void
  onEditFarm: () => void
  onDeleteFarm: () => void
  onSaveRecord: (record: FarmRecord) => void
  onDeleteRecord: (id: string) => void
}

const CATEGORY_HI = ['अन्य', 'बीज', 'बोवाई', 'फसल कटाई', 'फसल बीमा', 'जुताई', 'खाद डालना', 'डीज़ल', 'मशीनरी और उपकरण', 'कीटनाशक', 'खेती']
const CATEGORY_EN = ['Other', 'Seeds', 'Sowing', 'Harvesting', 'Crop insurance', 'Ploughing', 'Fertilizer', 'Diesel', 'Machinery', 'Pesticide', 'Farming']

function compactDate(value: string, lang: Lang) {
  if (!value) return '—'
  const date = new Date(`${value}T00:00:00`)
  const day = new Intl.DateTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: '2-digit' }).format(date)
  const month = new Intl.DateTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', { month: 'short' }).format(date)
  return `${day}-${month}-${date.getFullYear()}`
}

export function KhetDetail({ lang, farm, records, onBack, onDeleteFarm, onSaveRecord, onDeleteRecord }: Props) {
  const t = copy[lang]
  const [showRecord, setShowRecord] = useState(false)
  const [activeTab, setActiveTab] = useState<'records' | 'plan'>('records')
  const [menuId, setMenuId] = useState<string | null>(null)
  const totals = useMemo(() => ({
    income: records.filter((record) => record.type === 'income').reduce((sum, record) => sum + record.amount, 0),
    expense: records.filter((record) => record.type === 'expense').reduce((sum, record) => sum + record.amount, 0),
  }), [records])

  if (showRecord) {
    return <TransactionForm lang={lang} farm={farm} onBack={() => setShowRecord(false)} onSave={(record) => { onSaveRecord(record); setShowRecord(false) }} />
  }

  return (
    <div className="min-h-dvh bg-[var(--sk-bg)] pb-28">
      <header className="sticky top-0 z-30 bg-[var(--sk-green-deep)] text-white">
        <div className="mx-auto flex h-20 max-w-3xl items-center gap-4 px-4 sm:px-6">
          <button aria-label={t.back} onClick={onBack} className="grid size-11 place-items-center rounded-full hover:bg-white/10"><ArrowLeft size={29} /></button>
          <p className="min-w-0 flex-1 truncate text-2xl font-extrabold">{farm.name}</p>
          <span className="rounded-2xl bg-white/15 px-4 py-2 text-base font-bold">{lang === 'hi' ? 'बचत' : 'Save'}</span>
          <button aria-label="Refresh" className="grid size-11 place-items-center rounded-full hover:bg-white/10"><RefreshCw size={28} /></button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl">
        <section className="bg-[var(--sk-summary)] px-4 pb-6 pt-8 sm:px-6">
          <div className="mx-auto grid max-w-xl grid-cols-2">
            <FinanceStat icon={<HandCoins size={36} />} label={t.totalIncome} value={money(totals.income)} tone="income" />
            <FinanceStat icon={<ReceiptIndianRupee size={36} />} label={t.totalExpense} value={money(totals.expense)} tone="expense" divided />
          </div>
          <p className={`mt-4 text-center text-xl font-extrabold ${totals.income >= totals.expense ? 'text-[var(--sk-green)]' : 'text-[var(--sk-orange-red)]'}`}>
            {t.balance} &nbsp;{money(totals.income - totals.expense)}
          </p>
        </section>

        <div className="grid grid-cols-2 border-b border-[var(--sk-border)] bg-[var(--sk-card)]">
          <button onClick={() => setActiveTab('records')} className={`relative h-20 text-xl font-extrabold ${activeTab === 'records' ? 'text-[var(--sk-green)]' : 'text-[var(--sk-dim)]'}`}>
            {lang === 'hi' ? 'लेनदेन' : 'Transactions'}
            {activeTab === 'records' && <span className="absolute bottom-0 left-1/2 h-1 w-20 -translate-x-1/2 rounded-t-full bg-[var(--sk-green)]" />}
          </button>
          <button onClick={() => setActiveTab('plan')} className={`relative h-20 text-xl font-extrabold ${activeTab === 'plan' ? 'text-[var(--sk-green)]' : 'text-[var(--sk-dim)]'}`}>
            {lang === 'hi' ? 'फार्म योजना' : 'Farm plan'}
            {activeTab === 'plan' && <span className="absolute bottom-0 left-1/2 h-1 w-20 -translate-x-1/2 rounded-t-full bg-[var(--sk-green)]" />}
          </button>
        </div>

        {activeTab === 'records' ? (
          <section className="px-4 pt-5 sm:px-6">
            <div className="mb-6 flex items-center justify-between px-3 text-base font-bold text-[var(--sk-heading)]">
              <span>{lang === 'hi' ? 'प्रकार' : 'Type'}</span>
              <div className="flex items-center gap-14"><span>{lang === 'hi' ? 'रकम' : 'Amount'}</span><FileText size={24} className="text-[var(--sk-text)]" /></div>
            </div>

            <div className="space-y-4">
              {records.length === 0 ? (
                <div className="rounded-[1.75rem] bg-[var(--sk-card)] px-6 py-14 text-center shadow-[0_10px_28px_rgba(26,65,38,.08)]">
                  <ReceiptIndianRupee className="mx-auto text-[var(--sk-dim)]" size={34} />
                  <p className="mt-3 text-sm text-[var(--sk-dim)]">{t.noRecords}</p>
                </div>
              ) : records.map((record) => (
                <article key={record.id} className="relative grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-[1.75rem] bg-[var(--sk-card)] px-6 py-4 shadow-[0_9px_25px_rgba(26,65,38,.09)]">
                  <div className="min-w-0">
                    <p className="truncate text-xl font-extrabold">{record.category || (record.type === 'income' ? t.income : t.expense)}</p>
                    <p className="mt-2 text-base text-[var(--sk-dim)]">{compactDate(record.date, lang)}</p>
                  </div>
                  <div className="flex items-center gap-8">
                    <TrendingUp className={record.type === 'income' ? 'text-[var(--sk-income)]' : 'text-red-400'} size={22} />
                    <p className="min-w-28 text-right text-xl font-extrabold">
                      {record.type === 'yield' ? `${record.quantity} ${record.unit}` : money(record.amount)}
                    </p>
                  </div>
                  <div className="relative">
                    <button onClick={() => setMenuId(menuId === record.id ? null : record.id)} className="grid size-9 place-items-center text-[var(--sk-dim)]"><MoreVertical size={25} /></button>
                    {menuId === record.id && (
                      <div className="absolute right-0 top-10 z-20 w-36 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card)] p-1 shadow-xl">
                        <button onClick={() => { if (confirm(t.confirmRecord)) onDeleteRecord(record.id); setMenuId(null) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-500/10"><Trash2 size={15} />{t.delete}</button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section className="px-4 py-12 text-center sm:px-6">
            <div className="rounded-[1.75rem] bg-[var(--sk-card)] px-6 py-14 shadow-[0_10px_28px_rgba(26,65,38,.08)]">
              <CalendarDays className="mx-auto text-[var(--sk-green)]" size={38} />
              <p className="mt-4 text-lg font-bold">{lang === 'hi' ? 'फार्म योजना जल्द उपलब्ध होगी' : 'Farm plan coming soon'}</p>
              <p className="mt-1 text-sm text-[var(--sk-dim)]">{lang === 'hi' ? 'बुवाई से कटाई तक अपनी गतिविधियों की योजना बनाएँ।' : 'Plan activities from sowing to harvest.'}</p>
            </div>
          </section>
        )}
      </main>

      <button onClick={() => setShowRecord(true)} className="fixed bottom-7 right-4 z-20 flex h-16 items-center gap-3 rounded-2xl bg-[var(--sk-orange)] px-6 text-xl font-extrabold text-white shadow-[0_10px_22px_rgba(109,75,15,.3)] active:scale-[.98] sm:right-[max(1.5rem,calc((100vw-48rem)/2+1.5rem))]">
        <Plus size={30} />{lang === 'hi' ? 'लेन-देन जोड़ें' : 'Add transaction'}
      </button>

      <button onClick={() => confirm(t.confirmFarm) && onDeleteFarm()} className="sr-only">{t.deleteFarm}</button>
    </div>
  )
}

function TransactionForm({ lang, farm, onBack, onSave }: { lang: Lang; farm: Farm; onBack: () => void; onSave: (record: FarmRecord) => void }) {
  const isHi = lang === 'hi'
  const [type, setType] = useState<Extract<RecordType, 'expense' | 'income'>>('expense')
  const categories = isHi ? CATEGORY_HI : CATEGORY_EN
  const [category, setCategory] = useState(categories[1])
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [amount, setAmount] = useState('')
  const [shop, setShop] = useState('')
  const [note, setNote] = useState('')
  const [receiptName, setReceiptName] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!amount || Number(amount) <= 0) return
    onSave({
      id: crypto.randomUUID(),
      farmId: farm.id,
      type,
      date,
      category,
      amount: Number(amount),
      quantity: 0,
      unit: 'Kg',
      note: note.trim(),
      shop: shop.trim(),
      receiptName,
    })
  }

  return (
    <div className="min-h-dvh bg-[var(--sk-bg)]">
      <header className="sticky top-0 z-30 bg-[var(--sk-green-deep)] text-white">
        <div className="mx-auto flex h-20 max-w-3xl items-center gap-4 px-4 sm:px-6">
          <button aria-label="Back" onClick={onBack} className="grid size-11 place-items-center rounded-full hover:bg-white/10"><ArrowLeft size={29} /></button>
          <p className="text-2xl font-extrabold">{isHi ? 'लेन-देन बनाएँ' : 'Create transaction'}</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-4 pb-8 sm:p-6">
        <form onSubmit={submit} className="rounded-[2rem] bg-[var(--sk-card)] px-5 py-7 shadow-[0_10px_30px_rgba(26,65,38,.08)] sm:px-8 sm:py-9">
          <FieldLabel>{isHi ? 'लेनदेन का प्रकार' : 'Transaction type'}</FieldLabel>
          <div className="mt-5 flex gap-12">
            <Radio checked={type === 'expense'} label={isHi ? 'खर्च' : 'Expense'} onClick={() => { setType('expense'); setCategory(categories[1]) }} />
            <Radio checked={type === 'income'} label={isHi ? 'आय' : 'Income'} onClick={() => { setType('income'); setCategory(isHi ? 'फसल बिक्री' : 'Crop sale') }} />
          </div>

          <div className="mt-9 grid grid-cols-2 gap-5 sm:gap-8">
            <label>
              <FieldLabel required>{isHi ? 'खेती का नाम' : 'Farm name'}</FieldLabel>
              <div className="mt-3 flex h-12 items-center justify-between border-b-2 border-[var(--sk-border)] text-base text-[var(--sk-dim)]"><span>{farm.name}</span><ChevronDown size={20} /></div>
            </label>
            <label>
              <FieldLabel required>{isHi ? 'लेन - देन की तारीख' : 'Transaction date'}</FieldLabel>
              <div className="relative mt-3 border-b-2 border-[var(--sk-border)]">
                <input required type="date" className="h-12 w-full bg-transparent pr-1 text-base font-bold outline-none" value={date} onChange={(event) => setDate(event.target.value)} />
              </div>
            </label>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <FieldLabel required>{isHi ? 'लेन-देन श्रेणी' : 'Transaction category'}</FieldLabel>
              <button type="button" className="text-base font-bold text-[var(--sk-income)]"><Plus className="inline" size={18} /> {isHi ? 'जोड़ें' : 'Add'}</button>
            </div>
            <div className="-mx-1 mt-4 flex gap-3 overflow-x-auto px-1 pb-2">
              {categories.map((item) => (
                <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 rounded-full border-2 px-5 py-2 text-base font-semibold ${category === item ? 'border-[var(--sk-orange)] bg-orange-50 text-[var(--sk-orange)] dark:bg-orange-950/20' : 'border-[var(--sk-border)]'}`}>{item}</button>
              ))}
            </div>
          </div>

          <label className="mt-6 block">
            <FieldLabel required>{isHi ? 'लेन - देन की राशि' : 'Transaction amount'}</FieldLabel>
            <div className="mt-3 flex h-14 items-center gap-3 border-b-2 border-[var(--sk-border)]">
              <span className="text-xl">₹</span>
              <input required min="1" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder={isHi ? 'राशि दर्ज करें' : 'Enter amount'} className="h-full min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-[var(--sk-border)]" />
            </div>
          </label>

          <label className="mt-8 block">
            <div className="flex items-center justify-between"><FieldLabel>{isHi ? 'दुकान' : 'Shop'}</FieldLabel><span className="text-base font-bold text-[var(--sk-income)]"><Plus className="inline" size={18} /> {isHi ? 'दुकान जोड़ें' : 'Add shop'}</span></div>
            <div className="mt-3 flex h-14 items-center border-b-2 border-[var(--sk-border)]"><input value={shop} onChange={(event) => setShop(event.target.value)} placeholder={isHi ? 'दुकान चुनें' : 'Select shop'} className="h-full min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-[var(--sk-dim)]" /><ChevronDown size={21} /></div>
          </label>

          <label className="mt-8 block">
            <FieldLabel>{isHi ? 'टिप्पणियाँ' : 'Notes'}</FieldLabel>
            <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder={isHi ? 'टिप्पणियाँ दर्ज करें' : 'Enter notes'} className="mt-3 h-28 w-full resize-none border-b-2 border-[var(--sk-border)] bg-transparent py-2 text-lg outline-none placeholder:text-[var(--sk-border)]" />
          </label>

          <div className="mt-8">
            <FieldLabel>{isHi ? 'रसीद' : 'Receipt'}</FieldLabel>
            <label className="mt-4 flex h-24 cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-[var(--sk-border)] px-5 text-[var(--sk-dim)]">
              <Camera size={27} />
              <span className="truncate text-base">{receiptName || (isHi ? 'अपनी रसीद अपलोड करें' : 'Upload your receipt')}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(event) => setReceiptName(event.target.files?.[0]?.name ?? '')} />
            </label>
          </div>

          <button type="submit" className="mt-9 h-16 w-full rounded-2xl bg-[var(--sk-orange)] text-xl font-extrabold text-white shadow-[0_7px_16px_rgba(244,154,28,.28)]">{isHi ? 'सबमिट करे' : 'Submit'}</button>
        </form>
      </main>
    </div>
  )
}

function FinanceStat({ icon, label, value, tone, divided = false }: { icon: React.ReactNode; label: string; value: string; tone: 'income' | 'expense'; divided?: boolean }) {
  return <div className={`flex flex-col items-center px-3 text-center ${divided ? 'border-l border-[var(--sk-border)]' : ''}`}><div className={tone === 'income' ? 'text-[var(--sk-income)]' : 'text-[var(--sk-orange-red)]'}>{icon}</div><p className="mt-3 text-lg font-bold text-[var(--sk-heading)]">{label}</p><p className={`mt-1 text-2xl font-extrabold ${tone === 'income' ? 'text-[var(--sk-income)]' : 'text-[var(--sk-orange-red)]'}`}>{value}</p></div>
}

function FieldLabel({ children, required = false }: { children: React.ReactNode; required?: boolean }) {
  return <span className="text-base font-bold text-[var(--sk-heading)]">{children}{required && <span className="ml-1 text-red-500">*</span>}</span>
}

function Radio({ checked, label, onClick }: { checked: boolean; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex items-center gap-3 text-lg font-bold"><span className={`grid size-9 place-items-center rounded-full border-2 ${checked ? 'border-[var(--sk-orange)]' : 'border-[var(--sk-border)]'}`}>{checked && <span className="size-5 rounded-full bg-[var(--sk-orange)]" />}</span>{label}</button>
}
