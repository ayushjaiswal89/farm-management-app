import { useMemo, useRef, useState, type FormEvent } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  ChevronDown,
  FileDown,
  FileText,
  HandCoins,
  MoreVertical,
  Plus,
  ReceiptIndianRupee,
  RefreshCw,
  TrendingUp,
  Trash2,
  Pencil,
} from 'lucide-react'
import { copy, money, type Lang } from './farmI18n'
import type { Farm, FarmRecord, RecordType } from './types'

interface Props {
  lang: Lang
  farm: Farm
  records: FarmRecord[]
  openAdd?: boolean
  onBack: () => void
  onEditFarm: () => void
  onDeleteFarm: () => void
  onSaveRecord: (record: FarmRecord) => void
  onDeleteRecord: (id: string) => void
}

const CATEGORY_HI = [
  'अन्य',
  'बीज',
  'बोवाई',
  'फसल कटाई',
  'फसल बीमा',
  'जुताई',
  'खाद डालना',
  'डीज़ल',
  'मशीनरी और उपकरण',
  'कीटनाशक',
  'खेती',
]

const CATEGORY_EN = [
  'Other',
  'Seeds',
  'Sowing',
  'Harvesting',
  'Crop insurance',
  'Ploughing',
  'Fertilizer',
  'Diesel',
  'Machinery',
  'Pesticide',
  'Farming',
]

function compactDate(value: string, lang: Lang) {
  if (!value) return '—'

  const date = new Date(`${value}T00:00:00`)

  const day = new Intl.DateTimeFormat(
    lang === 'hi' ? 'hi-IN' : 'en-IN',
    { day: '2-digit' }
  ).format(date)

  const month = new Intl.DateTimeFormat(
    lang === 'hi' ? 'hi-IN' : 'en-IN',
    { month: 'short' }
  ).format(date)

  return `${day}-${month}-${date.getFullYear()}`
}

const pdfTh: React.CSSProperties = {
  border: '1px solid #cccccc',
  padding: '8px',
  textAlign: 'left',
  background: '#f3f4f6',
  fontWeight: 700,
}

const pdfTd: React.CSSProperties = {
  border: '1px solid #cccccc',
  padding: '8px',
  verticalAlign: 'top',
}

export function KhetDetail({
  lang,
  farm,
  records,
  onBack,
  onDeleteFarm,
  onSaveRecord,
  onDeleteRecord,
  openAdd = false,
}: Props) {
  const t = copy[lang]

  const [showRecord, setShowRecord] = useState(openAdd)

  // जिस transaction को edit करना है
  const [editingRecord, setEditingRecord] = useState<FarmRecord | null>(null)

  const [activeTab, setActiveTab] = useState<'records' | 'plan'>('records')
  const [menuId, setMenuId] = useState<string | null>(null)
  const pdfRef = useRef<HTMLDivElement>(null)
  const [creatingPdf, setCreatingPdf] = useState(false)
  const createFarmPdf = async () => {
    if (!pdfRef.current) return

    try {
      setCreatingPdf(true)

      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.95)

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = 210
      const pageHeight = 297
      const margin = 10

      const imgWidth = pageWidth - margin * 2
      const imgHeight =
        (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = margin

      pdf.addImage(
        imgData,
        'JPEG',
        margin,
        position,
        imgWidth,
        imgHeight
      )

      heightLeft -= pageHeight - margin * 2

      while (heightLeft > 0) {
        position =
          margin -
          (imgHeight - heightLeft)

        pdf.addPage()

        pdf.addImage(
          imgData,
          'JPEG',
          margin,
          position,
          imgWidth,
          imgHeight
        )

        heightLeft -= pageHeight - margin * 2
      }

      const safeName = farm.name
        .replace(/[\\/:*?"<>|]/g, '')
        .trim()

      pdf.save(
        `${safeName || 'Khet'}-Farm-Report.pdf`
      )
    } catch (error) {
      console.error('PDF Error:', error)

      alert(
        lang === 'hi'
          ? 'PDF बनाने में समस्या हुई।'
          : 'Failed to create PDF.'
      )
    } finally {
      setCreatingPdf(false)
    }
  }

  const totals = useMemo(
    () => ({
      income: records
        .filter((record) => record.type === 'income')
        .reduce((sum, record) => sum + record.amount, 0),

      expense: records
        .filter((record) => record.type === 'expense')
        .reduce((sum, record) => sum + record.amount, 0),
    }),
    [records]
  )

  /*
   * ADD या EDIT form
   */
  if (showRecord) {
    return (
      <TransactionForm
        lang={lang}
        farm={farm}
        record={editingRecord}
        onBack={() => {
          setShowRecord(false)
          setEditingRecord(null)
        }}
        onSave={(record) => {
          onSaveRecord(record)
          setShowRecord(false)
          setEditingRecord(null)
        }}
      />
    )
  }

  return (
    <div className="min-h-dvh bg-[var(--sk-bg)] pb-28">

      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-[var(--sk-green-deep)] text-white">
        <div className="mx-auto flex h-20 max-w-3xl items-center gap-4 px-4 sm:px-6">

          <button
            aria-label={t.back}
            onClick={onBack}
            className="grid size-11 place-items-center rounded-full hover:bg-white/10"
          >
            <ArrowLeft size={29} />
          </button>

          <p className="min-w-0 flex-1 truncate text-2xl font-extrabold">
            {farm.name}
          </p>

          <span className="rounded-2xl bg-white/15 px-4 py-2 text-base font-bold">
            {lang === 'hi' ? 'बचत' : 'Save'}
          </span>

          <button
            aria-label="Refresh"
            className="grid size-11 place-items-center rounded-full hover:bg-white/10"
          >
            <RefreshCw size={28} />
          </button>

        </div>
      </header>

      <main className="mx-auto max-w-3xl">

        {/* SUMMARY */}
        <section className="bg-[var(--sk-summary)] px-4 pb-6 pt-8 sm:px-6">

          <div className="mx-auto grid max-w-xl grid-cols-2">

            <FinanceStat
              icon={<HandCoins size={36} />}
              label={t.totalIncome}
              value={money(totals.income)}
              tone="income"
            />

            <FinanceStat
              icon={<ReceiptIndianRupee size={36} />}
              label={t.totalExpense}
              value={money(totals.expense)}
              tone="expense"
              divided
            />

          </div>

          <p
            className={`mt-4 text-center text-xl font-extrabold ${totals.income >= totals.expense
              ? 'text-[var(--sk-green)]'
              : 'text-[var(--sk-orange-red)]'
              }`}
          >
            {t.balance} &nbsp;{money(totals.income - totals.expense)}
          </p>

        </section>

        {/* TABS */}
        <div className="grid grid-cols-2 border-b border-[var(--sk-border)] bg-[var(--sk-card)]">

          <button
            onClick={() => setActiveTab('records')}
            className={`relative h-20 text-xl font-extrabold ${activeTab === 'records'
              ? 'text-[var(--sk-green)]'
              : 'text-[var(--sk-dim)]'
              }`}
          >
            {lang === 'hi' ? 'लेनदेन' : 'Transactions'}

            {activeTab === 'records' && (
              <span className="absolute bottom-0 left-1/2 h-1 w-20 -translate-x-1/2 rounded-t-full bg-[var(--sk-green)]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('plan')}
            className={`relative h-20 text-xl font-extrabold ${activeTab === 'plan'
              ? 'text-[var(--sk-green)]'
              : 'text-[var(--sk-dim)]'
              }`}
          >
            {lang === 'hi' ? 'फार्म योजना' : 'Farm plan'}

            {activeTab === 'plan' && (
              <span className="absolute bottom-0 left-1/2 h-1 w-20 -translate-x-1/2 rounded-t-full bg-[var(--sk-green)]" />
            )}
          </button>

        </div>

        {/* RECORDS */}
        {activeTab === 'records' ? (

          <section className="px-4 pt-5 sm:px-6">

            <div className="mb-6 flex items-center justify-between px-3 text-base font-bold text-[var(--sk-heading)]">

              <span>
                {lang === 'hi' ? 'प्रकार' : 'Type'}
              </span>

              <div className="flex items-center gap-14">
                <span>
                  {lang === 'hi' ? 'रकम' : 'Amount'}
                </span>

                <button
                  type="button"
                  onClick={createFarmPdf}
                  disabled={creatingPdf}
                  aria-label={lang === 'hi' ? 'PDF खोलें' : 'Open PDF'}
                  className="grid size-10 place-items-center rounded-xl text-[var(--sk-text)] hover:bg-[var(--sk-card2)] disabled:opacity-50"
                >
                  <FileDown size={24} />
                </button>
              </div>

            </div>

            <div className="space-y-4">

              {records.length === 0 ? (

                <div className="rounded-[1.75rem] bg-[var(--sk-card)] px-6 py-14 text-center shadow-[0_10px_28px_rgba(26,65,38,.08)]">

                  <ReceiptIndianRupee
                    className="mx-auto text-[var(--sk-dim)]"
                    size={34}
                  />

                  <p className="mt-3 text-sm text-[var(--sk-dim)]">
                    {t.noRecords}
                  </p>

                </div>

              ) : (

                records.map((record) => (

                  <article
                    key={record.id}
                    className="relative grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-[1.75rem] bg-[var(--sk-card)] px-6 py-4 shadow-[0_9px_25px_rgba(26,65,38,.09)]"
                  >

                    {/* NAME + DATE */}
                    <div className="min-w-0">

                      <p className="truncate text-xl font-extrabold">
                        {record.category ||
                          (record.type === 'income'
                            ? t.income
                            : t.expense)}
                      </p>

                      <p className="mt-2 text-base text-[var(--sk-dim)]">
                        {compactDate(record.date, lang)}
                      </p>

                    </div>

                    {/* AMOUNT */}
                    <div className="flex items-center gap-8">

                      <TrendingUp
                        className={
                          record.type === 'income'
                            ? 'text-[var(--sk-income)]'
                            : 'text-red-400'
                        }
                        size={22}
                      />

                      <p className="min-w-28 text-right text-xl font-extrabold">
                        {record.type === 'yield'
                          ? `${record.quantity} ${record.unit}`
                          : money(record.amount)}
                      </p>

                    </div>

                    {/* 3 DOT MENU */}
                    <div className="relative">

                      <button
                        onClick={() =>
                          setMenuId(
                            menuId === record.id
                              ? null
                              : record.id
                          )
                        }
                        className="grid size-9 place-items-center text-[var(--sk-dim)]"
                        aria-label="Transaction menu"
                      >
                        <MoreVertical size={25} />
                      </button>

                      {menuId === record.id && (

                        <div className="absolute right-0 top-10 z-20 w-40 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card)] p-1 shadow-xl">

                          {/* EDIT */}
                          <button
                            onClick={() => {
                              setEditingRecord(record)
                              setMenuId(null)
                              setShowRecord(true)
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-[var(--sk-green)]/10"
                          >
                            <Pencil size={15} />

                            {lang === 'hi'
                              ? 'संपादित करें'
                              : 'Edit'}
                          </button>

                          {/* DELETE */}
                          <button
                            onClick={() => {
                              if (confirm(t.confirmRecord)) {
                                onDeleteRecord(record.id)
                              }

                              setMenuId(null)
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-500/10"
                          >
                            <Trash2 size={15} />

                            {t.delete}
                          </button>

                        </div>

                      )}

                    </div>

                  </article>

                ))

              )}

            </div>

          </section>

        ) : (

          /* FARM PLAN */
          <section className="px-4 py-12 text-center sm:px-6">

            <div className="rounded-[1.75rem] bg-[var(--sk-card)] px-6 py-14 shadow-[0_10px_28px_rgba(26,65,38,.08)]">

              <CalendarDays
                className="mx-auto text-[var(--sk-green)]"
                size={38}
              />

              <p className="mt-4 text-lg font-bold">
                {lang === 'hi'
                  ? 'फार्म योजना जल्द उपलब्ध होगी'
                  : 'Farm plan coming soon'}
              </p>

              <p className="mt-1 text-sm text-[var(--sk-dim)]">
                {lang === 'hi'
                  ? 'बुवाई से कटाई तक अपनी गतिविधियों की योजना बनाएँ।'
                  : 'Plan activities from sowing to harvest.'}
              </p>

            </div>

          </section>

        )}

      </main>

      {/* ADD TRANSACTION */}
      <button
        onClick={() => {
          setEditingRecord(null)
          setShowRecord(true)
        }}
        className="fixed bottom-7 right-4 z-20 flex h-16 items-center gap-3 rounded-2xl bg-[var(--sk-orange)] px-6 text-xl font-extrabold text-white shadow-[0_10px_22px_rgba(109,75,15,.3)] active:scale-[.98] sm:right-[max(1.5rem,calc((100vw-48rem)/2+1.5rem))]"
      >
        <Plus size={30} />

        {lang === 'hi'
          ? 'लेन-देन जोड़ें'
          : 'Add transaction'}
      </button>

      <button
        onClick={() => confirm(t.confirmFarm) && onDeleteFarm()}
        className="sr-only"
      >
        {t.deleteFarm}
      </button>
      {/* =========================================================
    PDF REPORT
========================================================= */}

      <div
        ref={pdfRef}
        style={{
          position: 'fixed',
          left: '-10000px',
          top: 0,
          width: '794px',
          background: '#ffffff',
          color: '#111111',
          padding: '35px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {/* TITLE */}
        <div
          style={{
            borderBottom: '3px solid #f97316',
            paddingBottom: '15px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              fontSize: '28px',
              fontWeight: 800,
            }}
          >
            {lang === 'hi' ? 'खेत की रिपोर्ट' : 'Farm Report'}
          </div>

          <div
            style={{
              marginTop: '8px',
              fontSize: '20px',
              fontWeight: 700,
            }}
          >
            {farm.name}
          </div>
        </div>

        {/* FARM INFORMATION */}
        <div
          style={{
            border: '1px solid #d1d5db',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              fontSize: '19px',
              fontWeight: 800,
              marginBottom: '14px',
            }}
          >
            {lang === 'hi'
              ? 'खेत की जानकारी'
              : 'Farm Information'}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              fontSize: '14px',
            }}
          >
            <div>
              <strong>
                {lang === 'hi' ? 'खेत:' : 'Farm:'}
              </strong>{' '}
              {farm.name}
            </div>

            <div>
              <strong>
                {lang === 'hi' ? 'फसल:' : 'Crop:'}
              </strong>{' '}
              {farm.crop || '-'}
            </div>

            <div>
              <strong>
                {lang === 'hi' ? 'रकबा:' : 'Area:'}
              </strong>{' '}
              {farm.area} {farm.areaUnit}
            </div>

            <div>
              <strong>
                {lang === 'hi' ? 'बुवाई तारीख:' : 'Sowing Date:'}
              </strong>{' '}
              {farm.sowingDate || '-'}
            </div>

            <div>
              <strong>
                {lang === 'hi' ? 'कटाई तारीख:' : 'Harvest Date:'}
              </strong>{' '}
              {farm.harvestDate || '-'}
            </div>
          </div>
        </div>

        {/* SUMMARY */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              border: '1px solid #d1d5db',
              borderRadius: '10px',
              padding: '14px',
            }}
          >
            <div style={{ fontSize: '12px', color: '#666' }}>
              {lang === 'hi' ? 'कुल खर्च' : 'Total Expense'}
            </div>

            <div
              style={{
                marginTop: '5px',
                fontSize: '20px',
                fontWeight: 800,
              }}
            >
              {money(totals.expense)}
            </div>
          </div>

          <div
            style={{
              border: '1px solid #d1d5db',
              borderRadius: '10px',
              padding: '14px',
            }}
          >
            <div style={{ fontSize: '12px', color: '#666' }}>
              {lang === 'hi' ? 'कुल आय' : 'Total Income'}
            </div>

            <div
              style={{
                marginTop: '5px',
                fontSize: '20px',
                fontWeight: 800,
              }}
            >
              {money(totals.income)}
            </div>
          </div>

          <div
            style={{
              border: '1px solid #d1d5db',
              borderRadius: '10px',
              padding: '14px',
            }}
          >
            <div style={{ fontSize: '12px', color: '#666' }}>
              {lang === 'hi'
                ? 'बचत / मुनाफा'
                : 'Balance / Profit'}
            </div>

            <div
              style={{
                marginTop: '5px',
                fontSize: '20px',
                fontWeight: 800,
              }}
            >
              {money(totals.income - totals.expense)}
            </div>
          </div>
        </div>

        {/* TRANSACTIONS */}
        <div>
          <div
            style={{
              fontSize: '19px',
              fontWeight: 800,
              marginBottom: '12px',
            }}
          >
            {lang === 'hi'
              ? 'लेन-देन की पूरी जानकारी'
              : 'All Transactions'}
          </div>

          {records.length === 0 ? (
            <div
              style={{
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                padding: '20px',
                textAlign: 'center',
              }}
            >
              {lang === 'hi'
                ? 'कोई लेन-देन नहीं है'
                : 'No transactions found'}
            </div>
          ) : (
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '12px',
              }}
            >
              <thead>
                <tr>
                  <th style={pdfTh}>#</th>
                  <th style={pdfTh}>{lang === 'hi' ? 'तारीख' : 'Date'}</th>
                  <th style={pdfTh}>{lang === 'hi' ? 'प्रकार' : 'Type'}</th>
                  <th style={pdfTh}>{lang === 'hi' ? 'श्रेणी' : 'Category'}</th>
                  <th style={pdfTh}>{lang === 'hi' ? 'दुकान' : 'Shop'}</th>
                  <th style={pdfTh}>{lang === 'hi' ? 'टिप्पणी' : 'Note'}</th>
                  <th style={pdfTh}>{lang === 'hi' ? 'राशि' : 'Amount'}</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record, index) => (
                  <tr key={record.id}>
                    <td style={pdfTd}>
                      {index + 1}
                    </td>

                    <td style={pdfTd}>
                      {compactDate(record.date, lang)}
                    </td>

                    <td style={pdfTd}>
                      {record.type === 'income'
                        ? lang === 'hi'
                          ? 'आय'
                          : 'Income'
                        : lang === 'hi'
                          ? 'खर्च'
                          : 'Expense'}
                    </td>

                    <td style={pdfTd}>
                      {record.category || '-'}
                    </td>

                    <td style={pdfTd}>{record.shop || '-'}</td>

                    <td style={pdfTd}>
                      {record.note || '-'}
                    </td>

                    <td style={{ ...pdfTd, fontWeight: 700 }}>
                      {money(record.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* NOTES */}
        {records.some((record) => record.note) && (
          <div style={{ marginTop: '25px' }}>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 800,
                marginBottom: '10px',
              }}
            >
              {lang === 'hi' ? 'टिप्पणियाँ' : 'Notes'}
            </div>

            {records
              .filter((record) => record.note)
              .map((record) => (
                <div
                  key={record.id}
                  style={{
                    borderBottom: '1px solid #ddd',
                    padding: '7px 0',
                    fontSize: '12px',
                  }}
                >
                  <strong>{compactDate(record.date, lang)}</strong>
                  {' — '}
                  {record.note}
                </div>
              ))}
          </div>
        )}

        {/* FOOTER */}
        <div
          style={{
            marginTop: '30px',
            paddingTop: '12px',
            borderTop: '1px solid #ddd',
            textAlign: 'center',
            fontSize: '10px',
            color: '#666',
          }}
        >
          {lang === 'hi'
            ? 'Farm Management App द्वारा बनाई गई रिपोर्ट'
            : 'Report generated by Farm Management App'}
        </div>
      </div>
    </div>
  )
}

function compressImage(
  file: File,
  maxWidth = 1200,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const image = new Image()

      image.onload = () => {
        const scale = Math.min(
          1,
          maxWidth / image.width
        )

        const canvas = document.createElement('canvas')

        canvas.width = Math.round(image.width * scale)
        canvas.height = Math.round(image.height * scale)

        const context = canvas.getContext('2d')

        if (!context) {
          reject(new Error('Canvas not supported'))
          return
        }

        context.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        )

        const compressed = canvas.toDataURL(
          'image/jpeg',
          quality
        )

        resolve(compressed)
      }

      image.onerror = () => {
        reject(new Error('Image load failed'))
      }

      image.src = String(reader.result)
    }

    reader.onerror = () => {
      reject(new Error('File read failed'))
    }

    reader.readAsDataURL(file)
  })
}

/* =========================================================
   TRANSACTION FORM
========================================================= */


function TransactionForm({
  lang,
  farm,
  record,
  onBack,
  onSave,
}: {
  lang: Lang
  farm: Farm
  record: FarmRecord | null
  onBack: () => void
  onSave: (record: FarmRecord) => void
}) {
  const isHi = lang === 'hi'

  const categories = isHi ? CATEGORY_HI : CATEGORY_EN

  /*
   * अगर Edit है तो पुराने record की जानकारी लें
   * अगर Add है तो default values लें
   */
  const [type, setType] = useState<
    Extract<RecordType, 'expense' | 'income'>
  >(
    record?.type === 'income'
      ? 'income'
      : 'expense'
  )

  const [category, setCategory] = useState(
    record?.category ||
    (isHi ? CATEGORY_HI[1] : CATEGORY_EN[1])
  )

  const [date, setDate] = useState(
    record?.date ||
    new Date().toISOString().slice(0, 10)
  )

  const [amount, setAmount] = useState(
    record ? String(record.amount) : ''
  )

  const [shop, setShop] = useState(
    record?.shop || ''
  )

  const [note, setNote] = useState(
    record?.note || ''
  )

  const [receiptName, setReceiptName] = useState(
    record?.receiptName || ''
  )

  const [receiptImage, setReceiptImage] = useState(
    record?.receiptImage || ''
  )

  const submit = (event: FormEvent) => {
    event.preventDefault()

    if (!amount || Number(amount) <= 0) {
      return
    }

    onSave({
      /*
       * Edit में पुरानी ID रखेंगे
       * Add में नई ID बनेगी
       */
      id: record?.id || crypto.randomUUID(),

      farmId: farm.id,

      type,

      date,

      category,

      amount: Number(amount),

      quantity: record?.quantity || 0,

      unit: record?.unit || 'Kg',

      note: note.trim(),

      shop: shop.trim(),

      receiptName,
      receiptImage,
    })
  }

  return (
    <div className="min-h-dvh bg-[var(--sk-bg)]">

      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-[var(--sk-green-deep)] text-white">

        <div className="mx-auto flex h-20 max-w-3xl items-center gap-4 px-4 sm:px-6">

          <button
            aria-label="Back"
            onClick={onBack}
            className="grid size-11 place-items-center rounded-full hover:bg-white/10"
          >
            <ArrowLeft size={29} />
          </button>

          <p className="text-2xl font-extrabold">
            {record
              ? isHi
                ? 'लेन-देन संपादित करें'
                : 'Edit transaction'
              : isHi
                ? 'लेन-देन बनाएँ'
                : 'Create transaction'}
          </p>

        </div>

      </header>

      <main className="mx-auto max-w-3xl p-4 pb-8 sm:p-6">

        <form
          onSubmit={submit}
          className="rounded-[2rem] bg-[var(--sk-card)] px-5 py-7 shadow-[0_10px_30px_rgba(26,65,38,.08)] sm:px-8 sm:py-9"
        >

          {/* TYPE */}
          <FieldLabel>
            {isHi
              ? 'लेनदेन का प्रकार'
              : 'Transaction type'}
          </FieldLabel>

          <div className="mt-5 flex gap-12">

            <Radio
              checked={type === 'expense'}
              label={isHi ? 'खर्च' : 'Expense'}
              onClick={() => {
                setType('expense')

                setCategory(
                  isHi
                    ? CATEGORY_HI[1]
                    : CATEGORY_EN[1]
                )
              }}
            />

            <Radio
              checked={type === 'income'}
              label={isHi ? 'आय' : 'Income'}
              onClick={() => {
                setType('income')

                setCategory(
                  isHi
                    ? 'फसल बिक्री'
                    : 'Crop sale'
                )
              }}
            />

          </div>

          {/* FARM + DATE */}
          <div className="mt-9 grid grid-cols-2 gap-5 sm:gap-8">

            <label>

              <FieldLabel required>
                {isHi ? 'खेती का नाम' : 'Farm name'}
              </FieldLabel>

              <div className="mt-3 flex h-12 items-center justify-between border-b-2 border-[var(--sk-border)] text-base text-[var(--sk-dim)]">

                <span>{farm.name}</span>

                <ChevronDown size={20} />

              </div>

            </label>

            <label>

              <FieldLabel required>
                {isHi
                  ? 'लेन - देन की तारीख'
                  : 'Transaction date'}
              </FieldLabel>

              <div className="relative mt-3 border-b-2 border-[var(--sk-border)]">

                <input
                  required
                  type="date"
                  className="h-12 w-full bg-transparent pr-1 text-base font-bold outline-none"
                  value={date}
                  onChange={(event) =>
                    setDate(event.target.value)
                  }
                />

              </div>

            </label>

          </div>

          {/* CATEGORY */}
          <div className="mt-8">

            <div className="flex items-center justify-between">

              <FieldLabel required>
                {isHi
                  ? 'लेन-देन श्रेणी'
                  : 'Transaction category'}
              </FieldLabel>

              <button
                type="button"
                className="text-base font-bold text-[var(--sk-income)]"
              >
                <Plus
                  className="inline"
                  size={18}
                />

                {isHi ? 'जोड़ें' : 'Add'}
              </button>

            </div>

            <div className="-mx-1 mt-4 flex gap-3 overflow-x-auto px-1 pb-2">

              {categories.map((item) => (

                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`shrink-0 rounded-full border-2 px-5 py-2 text-base font-semibold ${category === item
                    ? 'border-[var(--sk-orange)] bg-orange-50 text-[var(--sk-orange)] dark:bg-orange-950/20'
                    : 'border-[var(--sk-border)]'
                    }`}
                >
                  {item}
                </button>

              ))}

            </div>

          </div>

          {/* AMOUNT */}
          <label className="mt-6 block">

            <FieldLabel required>
              {isHi
                ? 'लेन - देन की राशि'
                : 'Transaction amount'}
            </FieldLabel>

            <div className="mt-3 flex h-14 items-center gap-3 border-b-2 border-[var(--sk-border)]">

              <span className="text-xl">₹</span>

              <input
                required
                min="1"
                type="number"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                placeholder={
                  isHi
                    ? 'राशि दर्ज करें'
                    : 'Enter amount'
                }
                className="h-full min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-[var(--sk-border)]"
              />

            </div>

          </label>

          {/* SHOP */}
          <label className="mt-8 block">

            <div className="flex items-center justify-between">

              <FieldLabel>
                {isHi ? 'दुकान' : 'Shop'}
              </FieldLabel>

              <span className="text-base font-bold text-[var(--sk-income)]">

                <Plus
                  className="inline"
                  size={18}
                />

                {isHi
                  ? 'दुकान जोड़ें'
                  : 'Add shop'}

              </span>

            </div>

            <div className="mt-3 flex h-14 items-center border-b-2 border-[var(--sk-border)]">

              <input
                value={shop}
                onChange={(event) =>
                  setShop(event.target.value)
                }
                placeholder={
                  isHi
                    ? 'दुकान चुनें'
                    : 'Select shop'
                }
                className="h-full min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-[var(--sk-dim)]"
              />

              <ChevronDown size={21} />

            </div>

          </label>

          {/* NOTES */}
          <label className="mt-8 block">

            <FieldLabel>
              {isHi ? 'टिप्पणियाँ' : 'Notes'}
            </FieldLabel>

            <textarea
              value={note}
              onChange={(event) =>
                setNote(event.target.value)
              }
              placeholder={
                isHi
                  ? 'टिप्पणियाँ दर्ज करें'
                  : 'Enter notes'
              }
              className="mt-3 h-28 w-full resize-none border-b-2 border-[var(--sk-border)] bg-transparent py-2 text-lg outline-none placeholder:text-[var(--sk-border)]"
            />

          </label>

          {/* RECEIPT */}
          <div className="mt-8">

            <div className="flex items-center justify-between">
              <FieldLabel>
                {isHi ? 'रसीद' : 'Receipt'}
              </FieldLabel>

              {receiptImage && (
                <button
                  type="button"
                  onClick={() => {
                    setReceiptImage('')
                    setReceiptName('')
                  }}
                  className="text-sm font-bold text-red-600"
                >
                  {isHi ? 'हटाएं' : 'Remove'}
                </button>
              )}
            </div>

            {receiptImage ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card2)]">

                <img
                  src={receiptImage}
                  alt={isHi ? 'रसीद' : 'Receipt'}
                  className="max-h-72 w-full object-contain"
                />

                <div className="flex items-center justify-between gap-3 border-t border-[var(--sk-border)] px-4 py-3">

                  <span className="min-w-0 truncate text-sm font-semibold">
                    {receiptName}
                  </span>

                  <label className="shrink-0 cursor-pointer rounded-xl bg-[var(--sk-green)] px-4 py-2 text-sm font-bold text-white">
                    {isHi ? 'बदलें' : 'Change'}

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (event) => {
                        const file = event.target.files?.[0]

                        if (!file) return

                        try {
                          const image = await compressImage(file)

                          setReceiptImage(image)
                          setReceiptName(file.name)
                        } catch {
                          alert(
                            isHi
                              ? 'रसीद अपलोड नहीं हो सकी'
                              : 'Receipt upload failed'
                          )
                        }

                        event.target.value = ''
                      }}
                    />
                  </label>

                </div>

              </div>
            ) : (
              <label className="mt-4 flex min-h-24 cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-[var(--sk-border)] px-5 text-[var(--sk-dim)] hover:bg-[var(--sk-card2)]">

                <Camera size={27} />

                <span className="text-base">
                  {isHi
                    ? 'अपनी रसीद अपलोड करें'
                    : 'Upload your receipt'}
                </span>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0]

                    if (!file) return

                    try {
                      const image = await compressImage(file)

                      setReceiptImage(image)
                      setReceiptName(file.name)
                    } catch {
                      alert(
                        isHi
                          ? 'रसीद अपलोड नहीं हो सकी'
                          : 'Receipt upload failed'
                      )
                    }

                    event.target.value = ''
                  }}
                />

              </label>
            )}

          </div>


          {/* SAVE */}
          <button
            type="submit"
            className="mt-9 h-16 w-full rounded-2xl bg-[var(--sk-orange)] text-xl font-extrabold text-white shadow-[0_7px_16px_rgba(244,154,28,.28)]"
          >
            {record
              ? isHi
                ? 'बदलाव सेव करें'
                : 'Save changes'
              : isHi
                ? 'सबमिट करे'
                : 'Submit'}
          </button>

        </form>

      </main>

    </div>
  )
}


/* =========================================================
   FINANCE STAT
========================================================= */

function FinanceStat({
  icon,
  label,
  value,
  tone,
  divided = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  tone: 'income' | 'expense'
  divided?: boolean
}) {
  return (
    <div
      className={`flex flex-col items-center px-3 text-center ${divided
        ? 'border-l border-[var(--sk-border)]'
        : ''
        }`}
    >

      <div
        className={
          tone === 'income'
            ? 'text-[var(--sk-income)]'
            : 'text-[var(--sk-orange-red)]'
        }
      >
        {icon}
      </div>

      <p className="mt-3 text-lg font-bold text-[var(--sk-heading)]">
        {label}
      </p>

      <p
        className={`mt-1 text-2xl font-extrabold ${tone === 'income'
          ? 'text-[var(--sk-income)]'
          : 'text-[var(--sk-orange-red)]'
          }`}
      >
        {value}
      </p>

    </div>
  )
}


/* =========================================================
   FIELD LABEL
========================================================= */

function FieldLabel({
  children,
  required = false,
}: {
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <span className="text-base font-bold text-[var(--sk-heading)]">
      {children}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </span>
  )
}


/* =========================================================
   RADIO
========================================================= */

function Radio({
  checked,
  label,
  onClick,
}: {
  checked: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 text-lg font-bold"
    >

      <span
        className={`grid size-9 place-items-center rounded-full border-2 ${checked
          ? 'border-[var(--sk-orange)]'
          : 'border-[var(--sk-border)]'
          }`}
      >
        {checked && (
          <span className="size-5 rounded-full bg-[var(--sk-orange)]" />
        )}
      </span>

      {label}

    </button>
  )
}