export type Lang = 'hi' | 'en'

export const copy = {
  hi: {
    app: 'स्मार्ट खाता',
    appSub: 'मेरी खेती, मेरा हिसाब',
    farming: 'खेती',
    intro: 'अपने खेत, फसल और लेन-देन एक जगह संभालें',
    addFarm: 'खेती जोड़ें',
    editFarm: 'खेत बदलें',
    totalIncome: 'कुल आय',
    totalExpense: 'कुल खर्च',
    balance: 'शुद्ध लाभ',
    farms: 'कुल खेत',
    sowing: 'बुवाई',
    harvest: 'अपेक्षित कटाई',
    details: 'विवरण देखें',
    noFarms: 'अभी कोई खेत नहीं जोड़ा गया',
    noFarmsSub: 'पहला खेत जोड़कर फसल का पूरा हिसाब रखना शुरू करें।',
    farmName: 'खेत का नाम',
    crop: 'फसल',
    area: 'क्षेत्रफल',
    areaUnit: 'इकाई',
    sowingDate: 'बुवाई की तारीख',
    harvestDate: 'अपेक्षित कटाई',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    back: 'सभी खेत',
    addRecord: 'लेन-देन जोड़ें',
    edit: 'बदलें',
    delete: 'हटाएँ',
    deleteFarm: 'खेत हटाएँ',
    records: 'लेन-देन',
    noRecords: 'इस खेत में अभी कोई लेन-देन नहीं है।',
    expense: 'खर्च',
    income: 'आय / बिक्री',
    yield: 'पैदावार',
    date: 'तारीख',
    category: 'श्रेणी',
    amount: 'राशि',
    quantity: 'मात्रा',
    unit: 'इकाई',
    note: 'विवरण',
    recordType: 'रिकॉर्ड का प्रकार',
    offline: 'ऑफलाइन तैयार',
    stored: 'डेटा आपके डिवाइस पर सुरक्षित है',
    language: 'English',
    confirmFarm: 'क्या आप यह खेत और इसके सभी रिकॉर्ड हटाना चाहते हैं?',
    confirmRecord: 'क्या आप यह रिकॉर्ड हटाना चाहते हैं?',
    required: 'कृपया जरूरी जानकारी भरें।',
    profit: 'लाभ',
    loss: 'हानि',
  },
  en: {
    app: 'Smart Khaata',
    appSub: 'My farm, my accounts',
    farming: 'Farming',
    intro: 'Manage your fields, crops and transactions in one place',
    addFarm: 'Add farm',
    editFarm: 'Edit farm',
    totalIncome: 'Total income',
    totalExpense: 'Total expense',
    balance: 'Net profit',
    farms: 'Total farms',
    sowing: 'Sowing',
    harvest: 'Expected harvest',
    details: 'View details',
    noFarms: 'No fields added yet',
    noFarmsSub: 'Add your first field to start tracking the complete crop account.',
    farmName: 'Field name',
    crop: 'Crop',
    area: 'Area',
    areaUnit: 'Unit',
    sowingDate: 'Sowing date',
    harvestDate: 'Expected harvest',
    save: 'Save',
    cancel: 'Cancel',
    back: 'All farms',
    addRecord: 'Add transaction',
    edit: 'Edit',
    delete: 'Delete',
    deleteFarm: 'Delete farm',
    records: 'Transactions',
    noRecords: 'There are no transactions for this field yet.',
    expense: 'Expense',
    income: 'Income / sale',
    yield: 'Yield',
    date: 'Date',
    category: 'Category',
    amount: 'Amount',
    quantity: 'Quantity',
    unit: 'Unit',
    note: 'Note',
    recordType: 'Record type',
    offline: 'Offline ready',
    stored: 'Data is safely stored on your device',
    language: 'हिंदी',
    confirmFarm: 'Delete this field and all of its records?',
    confirmRecord: 'Delete this record?',
    required: 'Please fill in the required information.',
    profit: 'Profit',
    loss: 'Loss',
  },
} as const

export const cropNames: Record<string, Record<Lang, string>> = {
  Soybean: { hi: 'सोयाबीन', en: 'Soybean' },
  Maize: { hi: 'मक्का', en: 'Maize' },
  Wheat: { hi: 'गेहूँ', en: 'Wheat' },
  Rice: { hi: 'धान', en: 'Rice' },
  Cotton: { hi: 'कपास', en: 'Cotton' },
  Mustard: { hi: 'सरसों', en: 'Mustard' },
  Gram: { hi: 'चना', en: 'Gram' },
  Other: { hi: 'अन्य', en: 'Other' },
}

export const expenseCategories: Record<Lang, string[]> = {
  hi: ['बीज', 'खाद', 'दवाई', 'मजदूरी', 'सिंचाई', 'डीजल', 'मशीन', 'अन्य'],
  en: ['Seeds', 'Fertilizer', 'Pesticide', 'Labour', 'Irrigation', 'Diesel', 'Machinery', 'Other'],
}

export const areaUnits: Record<string, Record<Lang, string>> = {
  Bigha: { hi: 'बीघा', en: 'Bigha' },
  Acre: { hi: 'एकड़', en: 'Acre' },
  Hectare: { hi: 'हेक्टेयर', en: 'Hectare' },
}

export function areaUnitName(value: string, lang: Lang) {
  return areaUnits[value]?.[lang] ?? value
}

export function money(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function displayDate(value: string, lang: Lang) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}
