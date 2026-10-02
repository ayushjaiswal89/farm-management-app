export interface Farm {
  id: string
  name: string
  crop: string
  area: number
  areaUnit: string
  sowingDate: string
  harvestDate: string
}

export type RecordType = 'expense' | 'income' | 'yield'

export interface FarmRecord {
  id: string
  farmId: string
  type: RecordType
  date: string
  category: string
  amount: number
  quantity: number
  unit: string
  note: string
  shop?: string
  receiptName?: string
}
