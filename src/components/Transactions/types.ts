import { Dispatch, FunctionComponent, SetStateAction } from "react"
import { Transaction } from "../../utils/types"

export type SetTransactionApprovalFunction = (params: {
  transactionId: string
  newValue: boolean
}) => Promise<void>

type TransactionsProps = { transactions: Transaction[] | null }

type TransactionPaneProps = {
  transaction: Transaction
  loading: boolean
  approved?: boolean
  setTransactionApproval: SetTransactionApprovalFunction
  transactionApprovalState: {[k: string]: boolean}
  setTransactionApprovalState: Dispatch<SetStateAction<{ [k: string]: boolean }>>
}

export type TransactionsComponent = FunctionComponent<TransactionsProps>
export type TransactionPaneComponent = FunctionComponent<TransactionPaneProps>
